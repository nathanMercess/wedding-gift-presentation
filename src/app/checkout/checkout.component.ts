import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentMethodSelectorComponent } from './components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from './components/card-brick/card-brick.component';
import { PixDisplayComponent } from './components/pix-display/pix-display.component';
import { PaymentMethod } from './enums/payment-method.enum';

@Component({
  standalone: true,
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  imports: [CommonModule, PaymentMethodSelectorComponent, CardBrickComponent, PixDisplayComponent]
})
export class CheckoutComponent implements OnInit {
  public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;
  public activeMethod: PaymentMethod | null = null;
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

  public onMethodSelected(method: PaymentMethod): void {
    this.paymentApproved = false;
    this.activeMethod = method;
  }

  public onPaymentApproved(): void {
    this.paymentApproved = true;
    this.activeMethod = null;
  }
}
