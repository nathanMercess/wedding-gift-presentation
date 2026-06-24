import { AfterViewInit, Component, ElementRef, HostListener, InputSignal, OnDestroy, OnInit, OutputEmitterRef, ViewChild, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gift } from '../../models/gift.model';
import { ButtonComponent } from '../button/button.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GiftPhotoCardComponent } from '../gift-photo-card/gift-photo-card.component';
import { ContributionFormData, GiftContributionFormComponent, ContributionSubmitData } from '../gift-contribution-form/gift-contribution-form.component';
import { GiftPaymentStepComponent } from '../gift-payment-step/gift-payment-step.component';
import { GiftSuccessStepComponent } from '../gift-success-step/gift-success-step.component';
import { ModalStep } from '../../enums/modal-step.enum';
import { ButtonVariant } from '../../enums/button-variant.enum';
import { ButtonType } from '../../enums/button-type.enum';
import { ContributionType } from '../../enums/contribution-type.enum';

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
  public readonly modalTitleId: string = 'gift-details-modal-title';

  @ViewChild(GiftContributionFormComponent) private formRef?: GiftContributionFormComponent;
  @ViewChild('modalContainer') public modalContainer?: ElementRef<HTMLDivElement>;

  private previousFocusedElement: HTMLElement | null = null;
  private readonly hiddenSiblings: HTMLElement[] = [];
  private readonly focusableSelector: string = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  public constructor(public readonly host: ElementRef<HTMLElement>) {}

  public get remaining(): number {
    return Math.max(this.gift().total - this.gift().raised, 0);
  }

  public get progress(): number {
    return Math.min((this.gift().raised / this.gift().total) * 100, 100);
  }

  public get isUnavailable(): boolean {
    return this.gift().available === false;
  }

  public get isFullyFunded(): boolean {
    return this.gift().fullyFunded;
  }

  public get contributionLimit(): number {
    if (this.isFullyFunded)
      return this.gift().total;

    return this.remaining;
  }

  public get minAmount(): number {
    return Math.min(10, this.contributionLimit);
  }

  public get availableQuickAmounts(): number[] {
    return [50, 100, 200, 300].filter((a: number): boolean => a <= this.contributionLimit);
  }

  public get hasUnsavedInput(): boolean {
    if (this.step === ModalStep.Success)
      return false;

    return !!(this.formRef?.isDirty) || this.hasStoredContribution;
  }

  public get hasStoredContribution(): boolean {
    return this.contributorName.trim().length > 0 || this.contributorMessage.trim().length > 0 || this.contributionAmount > 0;
  }

  public get contributionFormData(): ContributionFormData | null {
    if (!this.hasStoredContribution)
      return null;

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
    this.previousFocusedElement = document.activeElement as HTMLElement | null;
    document.body.classList.add('modal-open');
    this.hidePageSiblings();
  }

  public ngAfterViewInit(): void {
    setTimeout((): void => this.focusFirstElement());
  }

  public ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
    this.restorePageSiblings();
    this.previousFocusedElement?.focus();
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
    if (this.step !== ModalStep.Contribution)
      return;

    this.contributorName = data.guestName;
    this.contributorMessage = data.guestMessage;
    this.contributionAmount = data.amount;
    this.contributionType = data.contributionType;
    this.customAmount = data.customAmount;
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
    const parentElement: HTMLElement | null = hostElement.parentElement;

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
}
