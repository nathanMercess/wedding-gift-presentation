import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Input,
    OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from '../../../../environments/environment';
import { PaymentService } from '../../services/payment.service';
import { CardPaymentDto } from '../../models/card-payment-dto.model';

@Component({
    selector: 'app-card-brick',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card-brick.component.html',
    styleUrl: './card-brick.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardBrickComponent implements AfterViewInit, OnDestroy {
    @Input() amount = 0;
    @Input() orderId = '';
    @Input() cardType: 'credit_card' | 'debit_card' = 'credit_card';

    brickReady = false;
    error = '';

    private brickController: any = null;

    private readonly cdr = inject(ChangeDetectorRef);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly router: Router
    ) { }

    async ngAfterViewInit(): Promise<void> {
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
                        amount: this.amount
                    },
                    customization: {
                        visual: {
                            hideFormTitle: true,
                            style: {
                                theme: 'flat',
                                customVariables: {
                                    // Colors
                                    colorBackground:       '#FFFFFF',
                                    colorText:             '#6B6B6B',
                                    colorSecondary:        '#F7F0EA',
                                    colorActionPrimary:    '#C79A6D',
                                    colorBorderHover:      '#C79A6D',
                                    colorBorderFocus:      '#C79A6D',
                                    // Inputs
                                    inputFocusedBorderColor: '#C79A6D',
                                    inputFocusedBoxShadow:   '0 0 0 3px rgba(199,154,109,0.18)',
                                    // Radii
                                    borderRadiusSmall:  '6px',
                                    borderRadiusMedium: '10px',
                                    borderRadiusLarge:  '14px',
                                    borderRadiusFull:   '9999px',
                                    // Button
                                    buttonHeight: '48px'
                                }
                            }
                        },
                        paymentMethods: {
                            maxInstallments: this.cardType === 'credit_card' ? 12 : 1
                        }
                    },
                    callbacks: {
                        onReady: () => {
                            this.brickReady = true;
                            this.cdr.markForCheck();
                        },
                        // onSubmit must return a Promise so the Brick controls its loading state
                        onSubmit: (formData: unknown) => this.onSubmit(formData),
                        onError: (err: unknown) => {
                            console.error('Card Brick error:', err);
                            this.error = 'Erro ao carregar o formulário de pagamento. Recarregue a página e tente novamente.';
                            this.cdr.markForCheck();
                        }
                    }
                }
            );
        } catch {
            this.error = 'Falha ao carregar o formulário de pagamento. Verifique sua conexão e tente novamente.';
            this.cdr.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onSubmit(formData: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const payer = formData.payer ?? {};
            const identification = payer.identification ?? {};

            const dto: CardPaymentDto = {
                orderId: this.orderId,
                amount: this.amount,
                cardToken: formData.token,
                paymentMethodId: formData.payment_method_id,
                issuerId: formData.issuer_id,
                installments: formData.installments ?? 1,
                cardType: this.cardType,
                payerEmail: payer.email ?? '',
                payerDocType: identification.type ?? 'CPF',
                payerDocNumber: identification.number ?? ''
            };

            this.paymentService.payWithCard(dto).subscribe({
                next: (res) => {
                    if (res.status === 'approved') {
                        resolve();
                        this.router.navigate(['/sucesso']);
                    } else if (res.status === 'in_process' || res.status === 'pending') {
                        resolve();
                        this.error = 'Pagamento em análise. Você será notificado assim que for confirmado.';
                        this.cdr.markForCheck();
                    } else {
                        reject(new Error(res.statusDetail ?? 'declined'));
                        this.error = 'Pagamento recusado: ' + (res.statusDetail ?? 'tente outro cartão.');
                        this.cdr.markForCheck();
                    }
                },
                error: () => {
                    reject(new Error('network_error'));
                    this.error = 'Erro ao processar o pagamento. Tente novamente.';
                    this.cdr.markForCheck();
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.brickController?.unmount();
    }
}
