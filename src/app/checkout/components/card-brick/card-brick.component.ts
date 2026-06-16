import { AfterViewInit, Component, InputSignal, NgZone, OnDestroy, OutputEmitterRef, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from '../../../../environments/environment';
import { PaymentService } from '../../services/payment.service';
import { PaymentState } from '../../models/payment-state.model';
import { CardPaymentDto } from '../../models/card-payment-dto.model';

@Component({
    selector: 'app-card-brick',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card-brick.component.html',
    styleUrl: './card-brick.component.scss'
})
export class CardBrickComponent implements AfterViewInit, OnDestroy {
    public readonly amount: InputSignal<number> = input<number>(0);
    public readonly orderId: InputSignal<string> = input<string>('');
    public readonly giftId: InputSignal<string> = input<string>('');
    public readonly contributorName: InputSignal<string> = input<string>('');
    public readonly message: InputSignal<string> = input<string>('');
    public readonly cardType: InputSignal<'credit_card' | 'debit_card'> = input<'credit_card' | 'debit_card'>('credit_card');
    public readonly payerEmail: InputSignal<string> = input<string>('');
    public readonly paymentApproved: OutputEmitterRef<void> = output<void>();

    public brickReady: boolean = false;
    public error: string = '';

    private brickController: any = null;
    private pendingResolve: (() => void) | null = null;
    private pendingReject: ((reason?: unknown) => void) | null = null;
    private loadTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

    private readonly ngZone: NgZone = inject(NgZone);

    public constructor(public readonly paymentService: PaymentService) {
        effect((): void => this.handlePaymentState(this.paymentService.paymentState()));
    }

    public ngAfterViewInit(): void {
        this.loadBrick();
    }

    public retryLoad(): void {
        this.brickController?.unmount();
        this.brickController = null;
        this.error = '';
        this.brickReady = false;
        this.loadBrick();
    }

    private async loadBrick(): Promise<void> {
        this.loadTimeoutHandle = setTimeout(() => {
            this.ngZone.run(() => {
                this.error = 'O formulário de pagamento está demorando para carregar. Verifique sua conexão.';
            });
        }, 15000);

        try {
            await loadMercadoPago();
            const mp = new (window as any)['MercadoPago'](
                environment.mercadoPagoPublicKey,
                { locale: 'pt-BR' }
            );
            const bricksBuilder = mp.bricks();

            this.brickController = await bricksBuilder.create(
                'cardPayment',
                'cardPaymentBrick_container',
                {
                    initialization: {
                        amount: this.amount(),
                        payer: {
                            email: this.payerEmail()
                        }
                    },
                    customization: {
                        visual: {
                            hideFormTitle: true,
                            style: {
                                theme: 'flat',
                                customVariables: {
                                    textPrimaryColor: '#6B6B6B',
                                    textSecondaryColor: '#9A9A9A',
                                    inputBackgroundColor: '#FFFFFF',
                                    formBackgroundColor: '#FFFFFF',
                                    baseColor: '#C79A6D',
                                    baseColorFirstVariant: '#d4aa83',
                                    baseColorSecondVariant: '#b08050',
                                    outlinePrimaryColor: '#C79A6D',
                                    outlineSecondaryColor: 'rgba(107,107,107,0.15)',
                                    buttonTextColor: '#FFFFFF',
                                    borderRadiusSmall: '6px',
                                    borderRadiusMedium: '10px',
                                    borderRadiusLarge: '10px',
                                    borderRadiusFull: '9999px',
                                    payButtonHeight: '48px',
                                    formInputsTextTransform: 'none'
                                }
                            }
                        },
                        paymentMethods: {
                            creditCard: 'all',
                            debitCard: 'all',
                            maxInstallments: this.cardType() === 'credit_card' ? 12 : 1
                        }
                    },
                    callbacks: {
                        onReady: () => {
                            this.clearLoadTimeout();
                            this.ngZone.run(() => {
                                this.brickReady = true;
                            });
                        },
                        onSubmit: (formData: unknown) => this.onSubmit(formData),
                        onError: (err: unknown) => {
                            console.error('Card Brick error:', err);
                            this.clearLoadTimeout();
                            this.ngZone.run(() => {
                                this.error = 'Erro ao carregar o formulário de pagamento. Tente novamente.';
                            });
                        }
                    }
                }
            );
        } catch {
            this.clearLoadTimeout();
            this.error = 'Falha ao carregar o formulário de pagamento. Verifique sua conexão e tente novamente.';
        }
    }

    private clearLoadTimeout(): void {
        if (this.loadTimeoutHandle !== null) {
            clearTimeout(this.loadTimeoutHandle);
            this.loadTimeoutHandle = null;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onSubmit(formData: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.pendingResolve = resolve;
            this.pendingReject = reject;

            const payer = formData.payer ?? {};
            const identification = payer.identification ?? {};

            const dto: CardPaymentDto = {
                giftId: this.giftId(),
                contributorName: this.contributorName(),
                message: this.message(),
                orderId: this.orderId(),
                amount: this.amount(),
                cardToken: formData.token,
                paymentMethodId: formData.payment_method_id,
                installments: formData.installments ?? 1,
                method: this.cardType(),
                payerEmail: payer.email ?? this.payerEmail(),
                payerDocType: identification.type ?? 'CPF',
                payerDocNumber: identification.number ?? ''
            };

            this.ngZone.run(() => this.paymentService.payWithCard(dto));
        });
    }

    private handlePaymentState(state: PaymentState): void {
        if (state.submitting || (!this.pendingResolve && !this.pendingReject)) return;

        this.ngZone.run(() => {
            if (state.response) {
                const response = state.response!;
                if (response.status === 'approved' || response.status === 'processed') {
                    this.pendingResolve?.();
                    this.paymentApproved.emit();
                } else if (response.status === 'in_process' || response.status === 'pending') {
                    this.pendingResolve?.();
                    this.error = 'Pagamento em análise. Você será notificado assim que for confirmado.';
                } else {
                    this.pendingReject?.(new Error(response.statusDetail ?? 'declined'));
                    this.error = 'Pagamento recusado: ' + (response.statusDetail ?? 'tente outro cartão.');
                }
            } else if (state.error) {
                this.pendingReject?.(new Error('network_error'));
                this.error = state.error;
            }

            this.pendingResolve = null;
            this.pendingReject = null;
        });
    }

    public ngOnDestroy(): void {
        this.clearLoadTimeout();
        this.brickController?.unmount();
    }
}
