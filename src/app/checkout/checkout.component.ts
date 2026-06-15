import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentMethodSelectorComponent } from './components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from './components/card-brick/card-brick.component';
import { PixDisplayComponent } from './components/pix-display/pix-display.component';
import { PayerInfoComponent, PayerData } from './components/payer-info/payer-info.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    PayerInfoComponent,
    PaymentMethodSelectorComponent,
    CardBrickComponent,
    PixDisplayComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  step: 'payer-info' | 'payment' = 'payer-info';
  activeMethod: 'credit_card' | 'debit_card' | 'pix' | null = null;
  orderId = '';
  totalAmount = 0;
  payerEmail = '';
  payerDocType = '';
  payerDocNumber = '';

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = (params['orderId'] as string) ?? '';
      this.totalAmount = Number(params['amount'] ?? 0);
    });
  }

  onPayerConfirmed(data: PayerData): void {
    this.payerEmail = data.email;
    this.payerDocType = data.docType;
    this.payerDocNumber = data.docNumber;
    this.step = 'payment';
  }

  onMethodSelected(method: 'credit_card' | 'debit_card' | 'pix'): void {
    this.activeMethod = method;
  }
}

