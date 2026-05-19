import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-gift-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './gift-details-modal.component.html',
  styleUrl: './gift-details-modal.component.scss'
})
export class GiftDetailsModalComponent {
  @Input() gift!: Gift;
  @Input() coupleName: string = '';
  @Output() close = new EventEmitter<void>();

  contributionType: 'full' | 'partial' = 'full';
  customAmount: string = '';
  guestName: string = '';
  guestEmail: string = '';
  guestMessage: string = '';
  quickAmounts = [50, 100, 200, 300];

  get remaining(): number {
    return this.gift.total - this.gift.raised;
  }

  get progress(): number {
    return (this.gift.raised / this.gift.total) * 100;
  }

  get isCompleted(): boolean {
    return this.gift.raised >= this.gift.total;
  }

  getContributionAmount(): number {
    if (this.contributionType === 'full') return this.remaining;
    return parseFloat(this.customAmount) || 0;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    console.log({
      giftId: this.gift.id,
      amount: this.getContributionAmount(),
      guestName: this.guestName,
      guestEmail: this.guestEmail,
      message: this.guestMessage,
    });
  }
}
