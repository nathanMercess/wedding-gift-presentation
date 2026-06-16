import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { GiftService } from '../../services/gift.service';
import { PaymentMethodSelectorComponent } from '../../checkout/components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from '../../checkout/components/card-brick/card-brick.component';
import { PixDisplayComponent } from '../../checkout/components/pix-display/pix-display.component';

@Component({
  selector: 'app-gift-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, PaymentMethodSelectorComponent, CardBrickComponent, PixDisplayComponent],
  templateUrl: './gift-details-modal.component.html',
  styleUrl: './gift-details-modal.component.scss'
})
export class GiftDetailsModalComponent {
  @Input() public gift!: Gift;
  @Input() public coupleName: string = '';
  @Output() public close: EventEmitter<void> = new EventEmitter<void>();

  public step: 'contribution' | 'payment' | 'success' = 'contribution';
  public activeMethod: 'credit_card' | 'debit_card' | 'pix' | null = null;

  public contributionType: 'full' | 'partial' = 'full';
  public customAmount: string = '';
  public guestName: string = '';
  public guestMessage: string = '';
  public quickAmounts: number[] = [50, 100, 200, 300];
  public validationError: string = '';

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
    const amount = this.getContributionAmount();

    if (!this.guestName.trim()) {
      this.validationError = 'Por favor, informe seu nome completo.';
      return;
    }
    if (amount <= 0) {
      this.validationError = 'Informe um valor de contribuição válido.';
      return;
    }

    this.validationError = '';
    this.step = 'payment';
  }

  public backToContribution(): void {
    this.step = 'contribution';
    this.activeMethod = null;
  }

  public onPaymentApproved(): void {
    this.activeMethod = null;
    this.step = 'success';
  }
}
