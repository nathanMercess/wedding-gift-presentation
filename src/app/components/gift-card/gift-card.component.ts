import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonSize } from '../../enums/button-size.enum';

@Component({
  standalone: true,
  selector: 'app-gift-card',
  templateUrl: './gift-card.component.html',
  styleUrl: './gift-card.component.scss',
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftCardComponent {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly presentClick: OutputEmitterRef<void> = output<void>();
  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly ButtonSize: typeof ButtonSize = ButtonSize;

  public get progressPercent(): number {
    return Math.min((this.gift().raised / this.gift().total) * 100, 100);
  }

  public onPresent(): void {
    this.presentClick.emit();
  }

  public onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.background = '#F7F0EA';
  }
}
