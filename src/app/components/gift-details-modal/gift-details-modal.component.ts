import { AfterViewInit, Component, ElementRef, HostListener, InputSignal, OnDestroy, OnInit, OutputEmitterRef, ViewChild, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GiftPhotoCardComponent } from '../gift-photo-card/gift-photo-card.component';
import { ContributionFormData, EMPTY_CONTRIBUTION_FORM_DATA, GiftContributionFormComponent, ContributionSubmitData } from '../gift-contribution-form/gift-contribution-form.component';
import { GiftPaymentStepComponent } from '../gift-payment-step/gift-payment-step.component';
import { GiftSuccessStepComponent } from '../gift-success-step/gift-success-step.component';
import { ModalStep } from '../../enums/modal-step.enum';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';
import { ContributionType } from '../../enums/contribution-type.enum';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { PaymentMethod } from '../../checkout/enums/payment-method.enum';
import { PaymentStatus } from '../../checkout/enums/payment-status.enum';
import { PaymentResult } from '../../checkout/models/payment-result.model';
import { PendingPayment } from '../../checkout/models/pending-payment.model';
import { PaymentStatusUtil } from '../../checkout/utils/payment-status.util';
import { GiftService } from '../../services/gift.service';

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
export class GiftDetailsModalComponent implements OnInit, OnDestroy, AfterViewInit {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly coupleName: InputSignal<string> = input<string>('');
  public readonly giftDisplayMode: InputSignal<GiftDisplayMode> = input<GiftDisplayMode>(GiftDisplayMode.Traditional);
  public readonly showGiftCategory: InputSignal<boolean> = input<boolean>(true);
  public readonly showGiftProgress: InputSignal<boolean> = input<boolean>(true);
  public readonly showContributionType: InputSignal<boolean> = input<boolean>(true);
  public readonly previewMode: InputSignal<boolean> = input<boolean>(false);
  public readonly resumePayment: InputSignal<PendingPayment | null> = input<PendingPayment | null>(null);
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
  public contributionType: ContributionType = ContributionType.Full;
  public customAmount: string = '';
  public showExitConfirm: boolean = false;
  public validatingContribution: boolean = false;
  public validationError: string = '';
  public updatedGift: Gift | null = null;
  public paymentResult: PaymentResult | null = null;
  public readonly modalTitleId: string = 'gift-details-modal-title';

  @ViewChild(GiftContributionFormComponent) private formRef?: GiftContributionFormComponent;
  @ViewChild('modalContainer') public modalContainer?: ElementRef<HTMLDivElement>;

  private previousFocusedElement: HTMLElement = document.body;
  private readonly hiddenSiblings: HTMLElement[] = [];
  private readonly focusableSelector: string = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  public constructor(public readonly host: ElementRef<HTMLElement>, public readonly giftService: GiftService) {}

  public get currentGift(): Gift {
    return this.updatedGift ?? this.gift();
  }

  public get remaining(): number {
    return Math.max(this.currentGift.total - this.currentGift.raised, 0);
  }

  public get isUnavailable(): boolean {
    if (this.isPrivateUnlimited)
      return false;

    return this.currentGift.available === false;
  }

  public get isFullyFunded(): boolean {
    if (this.isPrivateUnlimited)
      return false;

    return this.currentGift.fullyFunded;
  }

  public get contributionLimit(): number {
    if (this.isPrivateUnlimited)
      return this.currentGift.total;

    if (!this.currentGift.allowPartialContribution)
      return this.currentGift.total;

    if (this.isFullyFunded)
      return this.currentGift.total;

    return this.remaining;
  }

  public get minAmount(): number {
    return Math.min(10, this.contributionLimit);
  }

  public get availableQuickAmounts(): number[] {
    return [50, 100, 200, 300].filter((a: number): boolean => a <= this.contributionLimit);
  }

  public get isPrivateUnlimited(): boolean {
    return this.giftDisplayMode() === GiftDisplayMode.PrivateUnlimited;
  }

  public get hasUnsavedInput(): boolean {
    if (this.step === ModalStep.Success)
      return false;

    return !!(this.formRef?.isDirty) || this.hasStoredContribution;
  }

  public get hasStoredContribution(): boolean {
    return this.contributorName.trim().length > 0 || this.contributorMessage.trim().length > 0 || this.contributionAmount > 0;
  }

  public get contributionFormData(): ContributionFormData {
    if (!this.hasStoredContribution)
      return EMPTY_CONTRIBUTION_FORM_DATA;

    return {
      guestName: this.contributorName,
      guestMessage: this.contributorMessage,
      contributionType: this.contributionType,
      customAmount: this.customAmount,
    };
  }

  public get modalTitle(): string {
    if (this.isUnavailable)
      return 'Presente indisponível';

    if (this.step === ModalStep.Contribution)
      return 'Detalhes do Presente';

    if (this.step === ModalStep.Payment)
      return 'Pagamento';

    return 'Pagamento confirmado';
  }

  public ngOnInit(): void {
    this.previousFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : document.body;
    document.body.classList.add('modal-open');
    this.hidePageSiblings();

    if (this.previewMode())
      return;

    this.restorePendingPayment();
  }

  public ngAfterViewInit(): void {
    setTimeout((): void => this.focusFirstElement());
  }

  public ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
    this.restorePageSiblings();
    this.previousFocusedElement.focus();
  }

  @HostListener('document:keydown.escape')
  public onEscapePressed(): void {
    if (this.showExitConfirm) {
      this.cancelExit();
      return;
    }

    this.requestClose();
  }

  @HostListener('document:keydown.tab', ['$event'])
  public onTabPressed(event: KeyboardEvent): void {
    if (this.showExitConfirm)
      return;

    const focusableElements: HTMLElement[] = this.getFocusableElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
      this.modalContainer?.nativeElement.focus();
      return;
    }

    const firstElement: HTMLElement = focusableElements[0];
    const lastElement: HTMLElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  public onBackdropClick(event: MouseEvent): void {
    if (this.step !== ModalStep.Contribution)
      return;

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
    if (this.step !== ModalStep.Contribution || this.validatingContribution)
      return;

    this.validationError = '';
    this.validatingContribution = true;
    this.giftService.loadGuestGiftById(this.currentGift.id, (gift: Gift): void => this.confirmContributionWithGift(data, gift), (message: string): void => this.handleContributionValidationError(message));
  }

  public confirmContributionWithGift(data: ContributionSubmitData, gift: Gift): void {
    this.validatingContribution = false;
    this.updatedGift = gift;

    const contributionLimit: number = this.getContributionLimitForGift(gift);

    if (data.amount > contributionLimit) {
      this.validationError = `O saldo deste presente mudou. Valor disponivel agora: ${this.formatCurrency(contributionLimit)}.`;
      return;
    }

    this.contributorName = data.guestName;
    this.contributorMessage = data.guestMessage;
    this.contributionAmount = data.amount;
    this.contributionType = data.contributionType;
    this.customAmount = data.customAmount;
    this.orderId = crypto.randomUUID();
    this.step = ModalStep.Payment;
  }

  public handleContributionValidationError(message: string): void {
    this.validatingContribution = false;
    this.validationError = message;
  }

  public backToContribution(): void {
    this.step = ModalStep.Contribution;
  }

  public onPaymentApproved(): void {
    this.onPaymentResolved({
      orderId: this.orderId,
      amount: this.contributionAmount,
      giftId: this.currentGift.id,
      giftName: this.currentGift.name,
      contributorName: this.contributorName,
      message: this.contributorMessage,
      method: PaymentMethod.CreditCard,
      status: PaymentStatus.Approved,
      paidAt: new Date().toISOString(),
      contributionCreated: true,
    });
  }

  public onPaymentResolved(result: PaymentResult): void {
    this.paymentResult = result;
    this.step = ModalStep.Success;

    if (PaymentStatusUtil.isApproved(result.status))
      this.paymentCompleted.emit();
  }

  public closeAndRefresh(): void {
    this.paymentCompleted.emit();
    this.close.emit();
  }

  private focusFirstElement(): void {
    const focusableElements: HTMLElement[] = this.getFocusableElements();

    if (focusableElements.length === 0) {
      this.modalContainer?.nativeElement.focus();
      return;
    }

    focusableElements[0].focus();
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.modalContainer)
      return [];

    return Array.from(this.modalContainer.nativeElement.querySelectorAll<HTMLElement>(this.focusableSelector))
      .filter((element: HTMLElement): boolean => element.offsetParent !== null);
  }

  private hidePageSiblings(): void {
    const hostElement: HTMLElement = this.host.nativeElement;
    const parentElement = hostElement.parentElement;

    if (!parentElement)
      return;

    Array.from(parentElement.children).forEach((element: Element): void => {
      if (element === hostElement || !(element instanceof HTMLElement))
        return;

      element.setAttribute('aria-hidden', 'true');
      this.hiddenSiblings.push(element);
    });
  }

  private restorePageSiblings(): void {
    this.hiddenSiblings.forEach((element: HTMLElement): void => element.removeAttribute('aria-hidden'));
    this.hiddenSiblings.length = 0;
  }

  private restorePendingPayment(): void {
    const pendingPayment: PendingPayment | null = this.resumePayment();

    if (!pendingPayment)
      return;

    this.updatedGift = pendingPayment.gift;
    this.orderId = pendingPayment.orderId;
    this.contributorName = pendingPayment.contributorName;
    this.contributorMessage = pendingPayment.message;
    this.contributionAmount = pendingPayment.amount;
    this.contributionType = ContributionType.Partial;
    this.customAmount = String(pendingPayment.amount);

    if (pendingPayment.method === PaymentMethod.Pix || pendingPayment.method === PaymentMethod.None) {
      this.step = ModalStep.Payment;
      return;
    }

    if (PaymentStatusUtil.isPending(pendingPayment.status) || PaymentStatusUtil.isApproved(pendingPayment.status)) {
      this.paymentResult = this.toPaymentResult(pendingPayment);
      this.step = ModalStep.Success;
    }
  }

  private getContributionLimitForGift(gift: Gift): number {
    if (this.isPrivateUnlimited)
      return gift.total;

    if (!gift.allowPartialContribution)
      return gift.total;

    if (gift.fullyFunded)
      return gift.total;

    return Math.max(gift.total - gift.raised, 0);
  }

  private toPaymentResult(pendingPayment: PendingPayment): PaymentResult {
    return {
      orderId: pendingPayment.orderId,
      amount: pendingPayment.amount,
      giftId: pendingPayment.gift.id,
      giftName: pendingPayment.gift.name,
      contributorName: pendingPayment.contributorName,
      message: pendingPayment.message,
      method: pendingPayment.method,
      status: pendingPayment.status || PaymentStatus.Pending,
      statusDetail: pendingPayment.statusDetail,
      mpOrderId: pendingPayment.mpOrderId,
      paidAt: pendingPayment.updatedAt,
      contributionCreated: pendingPayment.contributionCreated,
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
