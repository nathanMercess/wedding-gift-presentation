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
    @Input() payerEmail = '';
    @Input() payerDocType = '';
    @Input() payerDocNumber = '';

    brickReady = false;
    error = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private brickController: any = null;

    private readonly cdr = inject(ChangeDetectorRef);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly router: Router
    ) { }

    async ngAfterViewInit(): Promise<void> {
        try {
            await loadMercadoPago();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                        payer: { email: this.payerEmail }
                    },
                    customization: {
                        visual: { style: { theme: 'default' } },
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
                            this.error = 'An error occurred loading the card form. Please refresh and try again.';
                            this.cdr.markForCheck();
                        }
                    }
                }
            );
        } catch {
            this.error = 'Failed to load the payment form. Please check your connection and try again.';
            this.cdr.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onSubmit(formData: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const dto: any = {
                orderId: this.orderId,
                amount: this.amount,
                cardToken: formData.token,
                paymentMethodId: formData.payment_method_id,
                issuerId: formData.issuer_id,
                installments: formData.installments ?? 1,
                cardType: this.cardType,
                method: this.cardType,  // ← adicionar: backend espera "method"
                payerEmail: this.payerEmail,
                payerDocType: this.payerDocType,
                payerDocNumber: this.payerDocNumber
            };

            this.paymentService.payWithCard(dto).subscribe({
                next: (res) => {
                    if (res.status === 'approved') {
                        resolve();
                        this.router.navigate(['/sucesso']);
                    } else if (res.status === 'in_process' || res.status === 'pending') {
                        resolve();
                        this.error = 'Payment is under review. You will be notified once it is confirmed.';
                        this.cdr.markForCheck();
                    } else {
                        reject(new Error(res.statusDetail ?? 'declined'));
                        this.error = 'Payment declined: ' + (res.statusDetail ?? 'Please try a different card.');
                        this.cdr.markForCheck();
                    }
                },
                error: () => {
                    reject(new Error('network_error'));
                    this.error = 'Error processing payment. Please try again.';
                    this.cdr.markForCheck();
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.brickController?.unmount();
    }
}
