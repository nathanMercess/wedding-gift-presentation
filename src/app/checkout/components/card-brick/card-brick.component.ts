import { AfterViewInit, ChangeDetectorRef, Component, inject, Input, NgZone, OnDestroy } from '@angular/core';
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
    styleUrl: './card-brick.component.scss'
})
export class CardBrickComponent implements AfterViewInit, OnDestroy {
    @Input() amount = 0;
    @Input() orderId = '';
    @Input() cardType: 'credit_card' | 'debit_card' = 'credit_card';
    @Input() payerEmail = '';

    brickReady = false;
    error = '';

    private brickController: any = null;

    private readonly cdr = inject(ChangeDetectorRef);
    private readonly ngZone = inject(NgZone);

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
                        amount: this.amount,
                        payer: {
                            email: this.payerEmail
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
                            maxInstallments: this.cardType === 'credit_card' ? 12 : 1
                        }
                    },
                    callbacks: {
                        onReady: () => {
                            this.ngZone.run(() => {
                                this.brickReady = true;
                            });
                        },
                        onSubmit: (formData: unknown) => this.onSubmit(formData),
                        onError: (err: unknown) => {
                            console.error('Card Brick error:', err);
                            this.ngZone.run(() => {
                                this.error = 'Erro ao carregar o formulário de pagamento. Recarregue a página e tente novamente.';
                            });
                        }
                    }
                }
            );
        } catch {
            this.error = 'Falha ao carregar o formulário de pagamento. Verifique sua conexão e tente novamente.';
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
                installments: formData.installments ?? 1,
                method: this.cardType,
                payerEmail: payer.email ?? this.payerEmail,
                payerDocType: identification.type ?? 'CPF',
                payerDocNumber: identification.number ?? ''
            };

            this.paymentService.payWithCard(dto).subscribe({
                next: (res) => {
                    this.ngZone.run(() => {
                        if (res.status === 'approved' || res.status === 'processed') {
                            resolve();
                            this.router.navigate(['/sucesso']);
                        } else if (res.status === 'in_process' || res.status === 'pending') {
                            resolve();
                            this.error = 'Pagamento em análise. Você será notificado assim que for confirmado.';
                        } else {
                            reject(new Error(res.statusDetail ?? 'declined'));
                            this.error = 'Pagamento recusado: ' + (res.statusDetail ?? 'tente outro cartão.');
                        }
                    });
                },
                error: () => {
                    this.ngZone.run(() => {
                        reject(new Error('network_error'));
                        this.error = 'Erro ao processar o pagamento. Tente novamente.';
                    });
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.brickController?.unmount();
    }
}