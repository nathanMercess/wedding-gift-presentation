import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gift } from '../../../models/gift.model';

@Component({
    selector: 'app-admin-gift-card',
    templateUrl: './admin-gift-card.component.html',
    styleUrl: './admin-gift-card.component.scss',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminGiftCardComponent {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly isEditing: InputSignal<boolean> = input<boolean>(false);
  public readonly edit: OutputEmitterRef<Gift> = output<Gift>();
  public readonly delete: OutputEmitterRef<Gift> = output<Gift>();

  public getProgressPercent(): number {
    if (this.gift().total <= 0)
      return 0;

    return Math.min((this.gift().raised / this.gift().total) * 100, 100);
  }
}
