import { Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { Gift } from '../../models/gift.model';

@Component({
  standalone: true,
  selector: 'app-gift-photo-card',
  templateUrl: './gift-photo-card.component.html',
  styleUrl: './gift-photo-card.component.scss',
  imports: [CommonModule],
})
export class GiftPhotoCardComponent {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly giftDisplayMode: InputSignal<GiftDisplayMode> = input<GiftDisplayMode>(GiftDisplayMode.Traditional);

  public get isPrivateUnlimited(): boolean {
    return this.giftDisplayMode() === GiftDisplayMode.PrivateUnlimited;
  }

  public get remaining(): number {
    return Math.max(this.gift().total - this.gift().raised, 0);
  }

  public get progressPercent(): number {
    if (this.gift().total <= 0)
      return 0;

    return Math.min((this.gift().raised / this.gift().total) * 100, 100);
  }

  public get contributionModeLabel(): string {
    if (this.gift().allowPartialContribution)
      return 'Aceita contribuicao parcial';

    return 'Presente integral';
  }
}
