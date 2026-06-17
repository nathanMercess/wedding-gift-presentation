import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethodSelectorComponent } from '../../checkout/components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from '../../checkout/components/card-brick/card-brick.component';
import { PixDisplayComponent } from '../../checkout/components/pix-display/pix-display.component';
import { PaymentMethod } from '../../checkout/enums/payment-method.enum';

@Component({
  standalone: true,
  selector: 'app-gift-payment-step',
  templateUrl: './gift-payment-step.component.html',
  styleUrl: './gift-payment-step.component.scss',
  imports: [CommonModule, PaymentMethodSelectorComponent, CardBrickComponent, PixDisplayComponent],
})
export class GiftPaymentStepComponent {
  public readonly giftId: InputSignal<string> = input.required<string>();
  public readonly giftName: InputSignal<string> = input.required<string>();
  public readonly amount: InputSignal<number> = input.required<number>();
  public readonly orderId: InputSignal<string> = input.required<string>();
  public readonly contributorName: InputSignal<string> = input.required<string>();
  public readonly message: InputSignal<string> = input<string>('');

  public readonly paymentApproved: OutputEmitterRef<void> = output<void>();

  public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;

  public activeMethod: PaymentMethod | null = null;
}
