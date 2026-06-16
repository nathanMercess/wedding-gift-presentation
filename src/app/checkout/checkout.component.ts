import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentMethodSelectorComponent } from './components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from './components/card-brick/card-brick.component';
import { PixDisplayComponent } from './components/pix-display/pix-display.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    PaymentMethodSelectorComponent,
    CardBrickComponent,
    PixDisplayComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  public activeMethod: 'credit_card' | 'debit_card' | 'pix' | null = null;
  public orderId: string = '';
  public totalAmount: number = 0;
  public paymentApproved: boolean = false;

  public constructor(public readonly route: ActivatedRoute) { }

  public ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = (params['orderId'] as string) ?? '';
      this.totalAmount = Number(params['amount'] ?? 0);
    });
  }

  public onMethodSelected(method: 'credit_card' | 'debit_card' | 'pix'): void {
    this.paymentApproved = false;
    this.activeMethod = method;
  }

  public onPaymentApproved(): void {
    this.paymentApproved = true;
    this.activeMethod = null;
  }
}
