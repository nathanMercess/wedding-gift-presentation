import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { Gift } from '../../models/gift.model';

@Component({
  standalone: true,
  selector: 'app-gift-card',
  templateUrl: './gift-card.component.html',
  styleUrl: './gift-card.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftCardComponent {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly giftDisplayMode: InputSignal<GiftDisplayMode> = input<GiftDisplayMode>(GiftDisplayMode.Traditional);
  public readonly presentClick: OutputEmitterRef<void> = output<void>();

  public get progressPercent(): number {
    if (this.gift().total <= 0)
      return 0;

    return Math.min((this.gift().raised / this.gift().total) * 100, 100);
  }

  public get remaining(): number {
    return Math.max(this.gift().total - this.gift().raised, 0);
  }

  public get contributionModeLabel(): string {
    if (this.gift().allowPartialContribution)
      return 'Parcial';

    return 'Integral';
  }

  public get isUnavailable(): boolean {
    if (this.isPrivateUnlimited)
      return false;

    return this.gift().available === false;
  }

  public get isFullyFunded(): boolean {
    if (this.isPrivateUnlimited)
      return false;

    return this.gift().fullyFunded;
  }

  public get isPrivateUnlimited(): boolean {
    return this.giftDisplayMode() === GiftDisplayMode.PrivateUnlimited;
  }

  public onPresent(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.isUnavailable)
      return;

    this.presentClick.emit();
  }

  public onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.background = '#d9d9d9';
  }
}
