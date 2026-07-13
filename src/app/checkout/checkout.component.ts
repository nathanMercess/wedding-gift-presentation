import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PaymentMethodSelectorComponent } from './components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from './components/card-brick/card-brick.component';
import { PixDisplayComponent } from './components/pix-display/pix-display.component';
import { PaymentMethod } from './enums/payment-method.enum';
import { CardBrickConfig } from './models/card-brick-config.model';
import { PaymentService } from './services/payment.service';
import { CreditCardFeeUtil } from './utils/credit-card-fee.util';

@Component({
  standalone: true,
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  imports: [CommonModule, PaymentMethodSelectorComponent, CardBrickComponent, PixDisplayComponent],
})
export class CheckoutComponent implements OnInit {
  public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;
  public activeMethod: PaymentMethod = PaymentMethod.None;
  public orderId: string = '';
  public totalAmount: number = 0;
  public paymentApproved: boolean = false;
  public cardConfig: CardBrickConfig = this.createCardConfig(PaymentMethod.CreditCard);

  public giftId: string = '';
  public giftName: string = 'Presente';
  public contributorName: string = '';
  public message: string = '';
  private payerEmail: string = '';

  public constructor(public readonly route: ActivatedRoute, public readonly router: Router, public readonly paymentService: PaymentService) {}

  public ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params): void => {
      this.orderId = (params['orderId'] as string) ?? '';
      this.totalAmount = Number(params['amount'] ?? 0);
      this.giftId = (params['giftId'] as string) ?? '';
      this.giftName = (params['giftName'] as string) ?? 'Presente';
      this.contributorName = (params['contributorName'] as string) ?? '';
      this.message = (params['message'] as string) ?? '';
      this.payerEmail = (params['payerEmail'] as string) ?? '';

      if (!this.orderId || this.totalAmount <= 0) {
        void this.router.navigate(['/']);
      }
    });
  }

  public onMethodSelected(method: PaymentMethod): void {
    if (this.paymentService.paymentState().submitting)
      return;

    this.paymentApproved = false;
    this.activeMethod = method;

    if (method !== PaymentMethod.CreditCard)
      return;

    this.cardConfig = this.createCardConfig(method);
  }

  public onPaymentApproved(): void {
    this.paymentApproved = true;
    this.activeMethod = PaymentMethod.None;
  }

  public onPaymentFailed(finalFailure: boolean): void {
    if (finalFailure)
      this.replaceOrderId();
  }

  public onPixRetryRequested(): void {
    this.replaceOrderId();
  }

  private createCardConfig(method: PaymentMethod.CreditCard): CardBrickConfig {
    return {
      amount: this.totalAmount,
      orderId: this.orderId,
      giftId: this.giftId,
      giftName: this.giftName,
      contributorName: this.contributorName,
      message: this.message,
      cardType: method,
      payerEmail: this.payerEmail,
      maxInstallments: CreditCardFeeUtil.getMaxInstallments(),
    };
  }

  private replaceOrderId(): void {
    this.orderId = crypto.randomUUID();

    if (this.activeMethod === PaymentMethod.CreditCard)
      this.cardConfig = this.createCardConfig(PaymentMethod.CreditCard);
  }
}
