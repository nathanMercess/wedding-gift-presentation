import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  public readonly title: InputSignal<string> = input<string>('Tem certeza?');
  public readonly message: InputSignal<string> = input<string>('');
  public readonly confirmLabel: InputSignal<string> = input<string>('Confirmar');
  public readonly cancelLabel: InputSignal<string> = input<string>('Cancelar');

  public readonly confirmed: OutputEmitterRef<void> = output<void>();
  public readonly cancelled: OutputEmitterRef<void> = output<void>();

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('confirm-backdrop')) {
      this.cancelled.emit();
    }
  }
}
