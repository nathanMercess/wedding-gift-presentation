import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seletor-metodo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seletor-metodo.component.html',
  styleUrl: './seletor-metodo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeletorMetodoComponent {
  @Output() methodSelected = new EventEmitter<'credit_card' | 'debit_card' | 'pix'>();

  activeMethod: 'credit_card' | 'debit_card' | 'pix' | null = null;

  select(method: 'credit_card' | 'debit_card' | 'pix'): void {
    this.activeMethod = method;
    this.methodSelected.emit(method);
  }
}
