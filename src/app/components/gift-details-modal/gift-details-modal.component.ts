import { Component, HostListener, InputSignal, OnDestroy, OnInit, OutputEmitterRef, ViewChild, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GiftPhotoCardComponent } from '../gift-photo-card/gift-photo-card.component';
import { GiftContributionFormComponent, ContributionSubmitData } from '../gift-contribution-form/gift-contribution-form.component';
import { GiftPaymentStepComponent } from '../gift-payment-step/gift-payment-step.component';
import { GiftSuccessStepComponent } from '../gift-success-step/gift-success-step.component';
import { ModalStep } from '../../enums/modal-step.enum';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';

@Component({
  standalone: true,
  selector: 'app-gift-details-modal',
  templateUrl: './gift-details-modal.component.html',
  styleUrl: './gift-details-modal.component.scss',
  imports: [
    CommonModule,
    ButtonComponent,
    ConfirmDialogComponent,
    GiftPhotoCardComponent,
    GiftContributionFormComponent,
    GiftPaymentStepComponent,
    GiftSuccessStepComponent,
  ],
})
export class GiftDetailsModalComponent implements OnInit, OnDestroy {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly coupleName: InputSignal<string> = input<string>('');
  public readonly close: OutputEmitterRef<void> = output<void>();
  public readonly paymentCompleted: OutputEmitterRef<void> = output<void>();

  public readonly ModalStep: typeof ModalStep = ModalStep;
  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly ButtonType: typeof ButtonType = ButtonType;

  public step: ModalStep = ModalStep.Contribution;
  public orderId: string = '';
  public contributorName: string = '';
  public contributorMessage: string = '';
  public contributionAmount: number = 0;
  public showExitConfirm: boolean = false;

  @ViewChild(GiftContributionFormComponent) private formRef?: GiftContributionFormComponent;

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
    return [50, 100, 200, 300].filter((a: number): boolean => a <= this.remaining);
  }

  public get hasUnsavedInput(): boolean {
    return this.step === ModalStep.Contribution && !!(this.formRef?.isDirty);
  }

  public ngOnInit(): void {
    document.body.classList.add('modal-open');
  }

  public ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
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

  public onContributionSubmit(data: ContributionSubmitData): void {
    this.contributorName = data.guestName;
    this.contributorMessage = data.guestMessage;
    this.contributionAmount = data.amount;
    this.orderId = crypto.randomUUID();
    this.step = ModalStep.Payment;
  }

  public backToContribution(): void {
    this.step = ModalStep.Contribution;
  }

  public onPaymentApproved(): void {
    this.step = ModalStep.Success;
    this.paymentCompleted.emit();
  }
}
