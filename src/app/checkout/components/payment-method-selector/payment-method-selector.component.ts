import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
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
export class PaymentMethodSelectorComponent {
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly methodSelected: OutputEmitterRef<PaymentMethod> = output<PaymentMethod>();

  public activeMethod: PaymentMethod = PaymentMethod.None;

  public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;

  public select(method: PaymentMethod): void {
    if (this.disabled())
      return;

    this.activeMethod = method;
    this.methodSelected.emit(method);
  }
}
