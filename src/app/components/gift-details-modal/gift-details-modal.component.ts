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
  @Input() gift!: Gift;
  @Input() coupleName: string = '';
  @Output() close = new EventEmitter<void>();

  contributionType: 'full' | 'partial' = 'full';
  customAmount: string = '';
  guestName: string = '';
  guestMessage: string = '';
  quickAmounts = [50, 100, 200, 300];

  submitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(private giftService: GiftService) {}

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
    const amount = this.getContributionAmount();
    if (!this.guestName || amount <= 0) return;

    this.submitting = true;
    this.submitError = '';
    this.giftService.contribute(this.gift.id, {
      guestName: this.guestName,
      amount,
      message: this.guestMessage || undefined
    }).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.submitting = false;
        this.gift = { ...this.gift, raised: Math.min(this.gift.raised + amount, this.gift.total) };
      },
      error: () => {
        this.submitError = 'Erro ao registrar contribuição. Tente novamente.';
        this.submitting = false;
      }
    });
  }
}
