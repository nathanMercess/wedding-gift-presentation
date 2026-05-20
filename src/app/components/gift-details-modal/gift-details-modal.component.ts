import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { GiftService } from '../../services/gift.service';

@Component({
  selector: 'app-gift-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './gift-details-modal.component.html',
  styleUrl: './gift-details-modal.component.scss'
})
export class GiftDetailsModalComponent {
  @Input() public gift!: Gift;
  @Input() public coupleName: string = '';
  @Output() public close: EventEmitter<void> = new EventEmitter<void>();

  public contributionType: 'full' | 'partial' = 'full';
  public customAmount: string = '';
  public guestName: string = '';
  public guestMessage: string = '';
  public quickAmounts: number[] = [50, 100, 200, 300];

  public constructor(public readonly giftService: GiftService) {
    this.giftService.resetContributionState();
  }

  public get remaining(): number {
    return this.gift.total - this.gift.raised;
  }

  public get progress(): number {
    return (this.gift.raised / this.gift.total) * 100;
  }

  public get isCompleted(): boolean {
    return this.gift.raised >= this.gift.total;
  }

  public getContributionAmount(): number {
    if (this.contributionType === 'full') return this.remaining;
    return parseFloat(this.customAmount) || 0;
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  public onSubmit(): void {
    const amount: number = this.getContributionAmount();
    if (!this.guestName || amount <= 0) return;

    this.giftService.contributeToGift(this.gift.id, {
      guestName: this.guestName,
      amount,
      message: this.guestMessage || undefined
    }, (): void => {
      this.gift = { ...this.gift, raised: Math.min(this.gift.raised + amount, this.gift.total) };
    });
  }
}
