import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentMethodSelectorComponent } from './components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from './components/card-brick/card-brick.component';
import { PixDisplayComponent } from './components/pix-display/pix-display.component';
import { PaymentMethod } from './enums/payment-method.enum';
import { CardBrickConfig } from './models/card-brick-config.model';

@Component({
  standalone: true,
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  imports: [CommonModule, PaymentMethodSelectorComponent, CardBrickComponent, PixDisplayComponent],
})
export class CheckoutComponent implements OnInit {
  public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;
  public activeMethod: PaymentMethod | null = null;
  public orderId: string = '';
  public totalAmount: number = 0;
  public paymentApproved: boolean = false;
  public cardConfig: CardBrickConfig | null = null;

  private giftId: string = '';
  private contributorName: string = '';
  private message: string = '';
  private payerEmail: string = '';

  public constructor(public readonly route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = (params['orderId'] as string) ?? '';
      this.totalAmount = Number(params['amount'] ?? 0);
      this.giftId = (params['giftId'] as string) ?? '';
      this.contributorName = (params['contributorName'] as string) ?? '';
      this.message = (params['message'] as string) ?? '';
      this.payerEmail = (params['payerEmail'] as string) ?? '';
    });
  }

  public onMethodSelected(method: PaymentMethod): void {
    this.paymentApproved = false;
    this.activeMethod = method;

    if (method === PaymentMethod.CreditCard || method === PaymentMethod.DebitCard) {
      this.cardConfig = {
        amount: this.totalAmount,
        orderId: this.orderId,
        giftId: this.giftId,
        contributorName: this.contributorName,
        message: this.message,
        cardType: method,
        payerEmail: this.payerEmail,
      };
    }
  }

  public onPaymentApproved(): void {
    this.paymentApproved = true;
    this.activeMethod = null;
  }
}
