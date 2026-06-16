import { ChangeDetectionStrategy, Component, OnInit, OutputEmitterRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../enums/payment-method.enum';

@Component({
  standalone: true,
  selector: 'app-payment-method-selector',
  templateUrl: './payment-method-selector.component.html',
  styleUrl: './payment-method-selector.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodSelectorComponent implements OnInit {
  public readonly methodSelected: OutputEmitterRef<PaymentMethod> = output<PaymentMethod>();

  public activeMethod: PaymentMethod = PaymentMethod.CreditCard;

  public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;

  public ngOnInit(): void {
    this.methodSelected.emit(this.activeMethod);
  }

  public select(method: PaymentMethod): void {
    this.activeMethod = method;
    this.methodSelected.emit(method);
  }
}
