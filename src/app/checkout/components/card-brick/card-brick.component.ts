import { AfterViewInit, Component, InputSignal, NgZone, OnDestroy, OutputEmitterRef, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from '../../../../environments/environment';
import { PaymentService } from '../../services/payment.service';
import { PaymentState } from '../../models/payment-state.model';
import { CardPaymentDto } from '../../models/card-payment-dto.model';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

@Component({
    standalone: true,
    selector: 'app-card-brick',
    templateUrl: './card-brick.component.html',
    styleUrl: './card-brick.component.scss',
    imports: [CommonModule]
})
export class CardBrickComponent implements AfterViewInit, OnDestroy {

    //==CLAUDE==: Criar interface para não ter varios inputs separados, e sim um input com a interface, para facilitar a passagem de dados e evitar erros de passar input errado.
    public readonly amount: InputSignal<number> = input<number>(0);
    public readonly orderId: InputSignal<string> = input<string>('');
    public readonly giftId: InputSignal<string> = input<string>('');
    public readonly contributorName: InputSignal<string> = input<string>('');
    public readonly message: InputSignal<string> = input<string>('');
    public readonly cardType: InputSignal<PaymentMethod.CreditCard | PaymentMethod.DebitCard> = input<PaymentMethod.CreditCard | PaymentMethod.DebitCard>(PaymentMethod.CreditCard);
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

            //==CLAUDE==: mover isso para uma service dele e o que for constante, criar a contante para não ficar com o código jogado
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
                            maxInstallments: this.cardType() === PaymentMethod.CreditCard ? 12 : 1
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
            /*
            ==CLAUDE==: (PROJETO TODO usar p-toast do primeng) Criar componente generico de erro, sucesso, info, warn , mudar no backend para retornar CODES de erro 
                        e o componente ter um switch para mostrar a mensagem correta para cada tipo de erro, ao invés de 
                        setar a mensagem de erro direto aqui, para evitar ter mensagens de erro espalhadas pelo código.
            */
            this.error = 'Falha ao carregar o formulário de pagamento. Verifique sua conexão e tente novamente.';
        }
    }

    private clearLoadTimeout(): void {
        if (this.loadTimeoutHandle !== null) {
            clearTimeout(this.loadTimeoutHandle);
            this.loadTimeoutHandle = null;
        }
    }

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

    private clearPending(): void {
        this.pendingResolve = null;
        this.pendingReject = null;
    }

    private handlePaymentState(state: PaymentState): void {
        if (state.submitting || (!this.pendingResolve && !this.pendingReject)) 
            return;

        this.ngZone.run(() => {
            if (state.error) {
                this.pendingReject?.(new Error('network_error'));
                this.error = state.error;
                this.clearPending();
                return;
            }

            if (!state.response) {
                this.clearPending();
                return;
            }

            const response = state.response!;

            if (response.status === PaymentStatus.Approved || response.status === PaymentStatus.Processed) {
                this.pendingResolve?.();
                this.paymentApproved.emit();
                this.clearPending();
                return;
            }

            if (response.status === PaymentStatus.InProcess || response.status === PaymentStatus.Pending) {
                this.pendingResolve?.();
                this.error = 'Pagamento em análise. Você será notificado assim que for confirmado.';
                this.clearPending();
                return;
            }

            this.pendingReject?.(new Error(response.statusDetail ?? 'declined'));
            this.error = 'Pagamento recusado: ' + (response.statusDetail ?? 'tente outro cartão.');
            this.clearPending();
        });
    }

    public ngOnDestroy(): void {
        this.clearLoadTimeout();
        this.brickController?.unmount();
    }
}
