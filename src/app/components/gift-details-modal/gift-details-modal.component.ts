import { Component, HostListener, InputSignal, OnDestroy, OnInit, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { GiftService } from '../../services/gift.service';
import { ToastService } from '../../services/toast.service';
import { PaymentMethodSelectorComponent } from '../../checkout/components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from '../../checkout/components/card-brick/card-brick.component';
import { PixDisplayComponent } from '../../checkout/components/pix-display/pix-display.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { PaymentMethod } from '../../checkout/enums/payment-method.enum';
import { ModalStep } from '../../enums/modal-step.enum';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';
import { ContributionType } from '../../enums/contribution-type.enum';

@Component({
  standalone: true,
  selector: 'app-gift-details-modal',
  templateUrl: './gift-details-modal.component.html',
  styleUrl: './gift-details-modal.component.scss',
  imports: [CommonModule, FormsModule, ButtonComponent, PaymentMethodSelectorComponent, CardBrickComponent, PixDisplayComponent, ConfirmDialogComponent]
})
export class GiftDetailsModalComponent implements OnInit, OnDestroy {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly coupleName: InputSignal<string> = input<string>('');
  public readonly close: OutputEmitterRef<void> = output<void>();
  public readonly paymentCompleted: OutputEmitterRef<void> = output<void>();

  public readonly ModalStep: typeof ModalStep = ModalStep;
  public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;
  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly ButtonType: typeof ButtonType = ButtonType;
  public readonly ContributionType: typeof ContributionType = ContributionType;

  public step: ModalStep = ModalStep.Contribution;
  public activeMethod: PaymentMethod | null = null;
  public orderId: string = '';
  public contributionType: ContributionType = ContributionType.Full;
  public customAmount: string = '';
  public guestName: string = '';
  public guestMessage: string = '';
  public quickAmounts: number[] = [50, 100, 200, 300];
  public showExitConfirm: boolean = false;

  public constructor(public readonly giftService: GiftService, public readonly toastService: ToastService) {
    this.giftService.resetContributionState();
  }

  public ngOnInit(): void {
    document.body.classList.add('modal-open');
  }

  public ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
  }

  public get hasUnsavedInput(): boolean {
    return this.step === ModalStep.Contribution && (this.guestName.trim().length > 0 || this.customAmount.trim().length > 0);
  }

  public get remaining(): number {
    return this.gift().total - this.gift().raised;
  }

  public get progress(): number {
    return (this.gift().raised / this.gift().total) * 100;
  }

  public get isCompleted(): boolean {
    return !this.gift().available;
  }

  public get minAmount(): number {
    return Math.min(10, this.remaining);
  }

  public get availableQuickAmounts(): number[] {
    return this.quickAmounts.filter((amount: number): boolean => amount <= this.remaining);
  }

  public getContributionAmount(): number {
    if (this.contributionType === ContributionType.Full)
      return this.remaining;

    return parseFloat(this.customAmount) || 0;
  }

  @HostListener('document:keydown.escape')
  public onEscapePressed(): void {
    if (this.showExitConfirm) {
      this.cancelExit();
      return;
    }

    this.requestClose();
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) 
      this.requestClose();
  }

  public requestClose(): void {
    if (this.hasUnsavedInput) {
      this.showExitConfirm = true;
      return;
    }

    this.close.emit();
  }

  public confirmExit(): void {
    this.showExitConfirm = false;
    this.close.emit();
  }

  public cancelExit(): void {
    this.showExitConfirm = false;
  }

  public onSubmit(): void {
    const amount = this.getContributionAmount();

    if (!this.guestName.trim()) {
      this.toastService.error('Por favor, informe seu nome completo.', 'Campo obrigatório');
      return;
    }

    if (this.contributionType === ContributionType.Partial && amount < this.minAmount) {
      this.toastService.error(`O valor mínimo de contribuição é R$ ${this.minAmount.toFixed(2).replace('.', ',')}.`, 'Valor inválido');
      return;
    }

    if (amount <= 0) {
      this.toastService.error('Informe um valor de contribuição válido.', 'Valor inválido');
      return;
    }

    if (amount > this.remaining) {
      this.toastService.error(`O valor não pode ser maior que R$ ${this.remaining.toFixed(2).replace('.', ',')}.`, 'Valor inválido');
      return;
    }

    this.orderId = crypto.randomUUID();
    this.step = ModalStep.Payment;
  }

  public backToContribution(): void {
    this.step = ModalStep.Contribution;
    this.activeMethod = null;
  }

  public onPaymentApproved(): void {
    this.activeMethod = null;
    this.step = ModalStep.Success;
    this.paymentCompleted.emit();
  }
}