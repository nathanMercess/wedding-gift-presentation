import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  imports: [CommonModule, ButtonComponent]
})
export class ConfirmDialogComponent {
  public readonly title: InputSignal<string> = input<string>('Tem certeza?');
  public readonly message: InputSignal<string> = input<string>('');
  public readonly confirmLabel: InputSignal<string> = input<string>('Confirmar');
  public readonly cancelLabel: InputSignal<string> = input<string>('Cancelar');
  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly ButtonType: typeof ButtonType = ButtonType;

  public readonly confirmed: OutputEmitterRef<void> = output<void>();
  public readonly cancelled: OutputEmitterRef<void> = output<void>();

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('confirm-backdrop')) {
      this.cancelled.emit();
    }
  }
}
