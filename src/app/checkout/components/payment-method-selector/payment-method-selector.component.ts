import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method-selector.component.html',
  styleUrl: './payment-method-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodSelectorComponent {
  @Output() methodSelected = new EventEmitter<'credit_card' | 'debit_card' | 'pix'>();

  activeMethod: 'credit_card' | 'debit_card' | 'pix' | null = null;

  select(method: 'credit_card' | 'debit_card' | 'pix'): void {
    this.activeMethod = method;
    this.methodSelected.emit(method);
  }
}
