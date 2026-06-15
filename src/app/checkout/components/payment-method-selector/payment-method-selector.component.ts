import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method-selector.component.html',
  styleUrl: './payment-method-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodSelectorComponent implements OnInit {
  @Output() methodSelected = new EventEmitter<'credit_card' | 'debit_card' | 'pix'>();

  public activeMethod: 'credit_card' | 'debit_card' | 'pix' = 'credit_card';


  public ngOnInit(): void {
    this.methodSelected.emit(this.activeMethod);
  }

  public select(method: 'credit_card' | 'debit_card' | 'pix'): void {
    this.activeMethod = method;
    this.methodSelected.emit(method);
  }
}
