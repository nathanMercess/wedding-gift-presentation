import { Component, InputSignal, OnInit, OutputEmitterRef, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethodSelectorComponent } from '../../checkout/components/payment-method-selector/payment-method-selector.component';
import { CardBrickComponent } from '../../checkout/components/card-brick/card-brick.component';
import { PixDisplayComponent } from '../../checkout/components/pix-display/pix-display.component';
import { PaymentMethod } from '../../checkout/enums/payment-method.enum';
import { PaymentStatus } from '../../checkout/enums/payment-status.enum';
import { PaymentResponse } from '../../checkout/models/payment-response.model';
import { PaymentResult } from '../../checkout/models/payment-result.model';
import { PendingPayment } from '../../checkout/models/pending-payment.model';
import { PaymentResumeService } from '../../checkout/services/payment-resume.service';
import { PaymentService } from '../../checkout/services/payment.service';
import { CreditCardFeeUtil } from '../../checkout/utils/credit-card-fee.util';
import { PaymentStatusUtil } from '../../checkout/utils/payment-status.util';
import { Gift } from '../../models/gift.model';

@Component({
  standalone: true,
  selector: 'app-gift-payment-step',
  templateUrl: './gift-payment-step.component.html',
  styleUrl: './gift-payment-step.component.scss',
  imports: [CommonModule, PaymentMethodSelectorComponent, CardBrickComponent, PixDisplayComponent],
})
export class GiftPaymentStepComponent implements OnInit {
  public readonly gift: InputSignal<Gift> = input.required<Gift>();
  public readonly giftId: InputSignal<string> = input.required<string>();
  public readonly amount: InputSignal<number> = input.required<number>();
  public readonly orderId: InputSignal<string> = input.required<string>();
  public readonly contributorName: InputSignal<string> = input.required<string>();
  public readonly message: InputSignal<string> = input<string>('');
  public readonly resumePayment: InputSignal<PendingPayment | null> = input<PendingPayment | null>(null);

  public readonly paymentApproved: OutputEmitterRef<void> = output<void>();
  public readonly paymentResolved: OutputEmitterRef<PaymentResult> = output<PaymentResult>();
  public readonly processingChanged: OutputEmitterRef<boolean> = output<boolean>();
  public readonly orderIdChanged: OutputEmitterRef<string> = output<string>();

  public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;

  public activeMethod: PaymentMethod = PaymentMethod.None;
  public currentOrderId: string = '';
  private wasProcessing: boolean = false;

  public constructor(public readonly paymentService: PaymentService, public readonly paymentResumeService: PaymentResumeService) {
    effect((): void => {
      const submitting: boolean = this.paymentService.paymentState().submitting;
      this.processingChanged.emit(submitting);

      if (submitting && !this.wasProcessing && this.activeMethod !== PaymentMethod.None)
        this.savePending({ method: this.activeMethod, status: PaymentStatus.Pending });

      this.wasProcessing = submitting;
    }, { allowSignalWrites: true });
  }

  public ngOnInit(): void {
    const pendingPayment: PendingPayment | null = this.resumePayment();
    this.currentOrderId = pendingPayment?.orderId ?? this.orderId();

    if (!pendingPayment)
      return;

    this.activeMethod = pendingPayment.method;
  }

  public get maxInstallments(): number {
    return CreditCardFeeUtil.getMaxInstallments();
  }

  public get pixResumePayment(): PendingPayment | null {
    const pendingPayment: PendingPayment | null = this.paymentResumeService.state().pending;

    if (!pendingPayment || pendingPayment.method !== PaymentMethod.Pix)
      return null;

    if (pendingPayment.orderId !== this.currentOrderId || pendingPayment.gift.id !== this.giftId())
      return null;

    return pendingPayment;
  }

  public onMethodSelected(method: PaymentMethod): void {
    if (this.paymentService.paymentState().submitting)
      return;

    const pendingPayment: PendingPayment | null = this.paymentResumeService.state().pending;

    if (method !== PaymentMethod.None && pendingPayment?.orderId === this.currentOrderId && pendingPayment.method !== method)
      this.replaceOrderId();

    this.activeMethod = method;
  }

  public onPixReady(response: PaymentResponse): void {
    const expiresAt: string = response.expiresAt ?? new Date(Date.now() + 10 * 60 * 1000).toISOString();

    this.savePending({
      method: PaymentMethod.Pix,
      status: response.status,
      statusDetail: response.statusDetail,
      mpOrderId: response.mpOrderId,
      qrCode: response.qrCode ?? response.pixQrCode,
      qrCodeBase64: response.qrCodeBase64,
      expiresAt,
      contributionCreated: response.contributionCreated ?? false,
    });
  }

  public onPaymentResolved(result: PaymentResult): void {
    if (PaymentStatusUtil.isApproved(result.status)) {
      this.paymentResumeService.clear(result.orderId);
      this.paymentApproved.emit();
      this.paymentResolved.emit(result);
      return;
    }

    this.savePending({
      method: result.method,
      status: result.status,
      statusDetail: result.statusDetail,
      mpOrderId: result.mpOrderId,
      contributionCreated: result.contributionCreated,
    });
    this.paymentResolved.emit(result);
  }

  public onPixCancelled(): void {
    if (this.paymentService.paymentState().submitting)
      return;

    this.activeMethod = PaymentMethod.None;
  }

  public onPaymentFailed(finalFailure: boolean): void {
    if (finalFailure)
      this.replaceOrderId();
  }

  public onPixRetryRequested(): void {
    this.replaceOrderId();
  }

  private savePending(partialPayment: Partial<PendingPayment>): void {
    const now: string = new Date().toISOString();
    const pending: PendingPayment = {
      orderId: this.currentOrderId,
      gift: this.gift(),
      amount: this.amount(),
      contributorName: this.contributorName(),
      message: this.message(),
      method: this.activeMethod,
      status: PaymentStatus.Pending,
      createdAt: this.resumePayment()?.createdAt ?? now,
      updatedAt: now,
      contributionCreated: false,
      ...partialPayment,
    };

    this.paymentResumeService.save(pending);
  }

  private replaceOrderId(): void {
    this.paymentResumeService.clear(this.currentOrderId);
    this.currentOrderId = crypto.randomUUID();
    this.orderIdChanged.emit(this.currentOrderId);
  }
}
