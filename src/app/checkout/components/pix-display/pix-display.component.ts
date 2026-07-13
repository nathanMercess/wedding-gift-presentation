import { Component, HostListener, InputSignal, OnDestroy, OnInit, OutputEmitterRef, WritableSignal, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { PaymentState } from '../../models/payment-state.model';
import { PaymentStatusState } from '../../models/payment-status-state.model';
import { PixPaymentDto } from '../../models/pix-payment-dto.model';
import { PaymentResult } from '../../models/payment-result.model';
import { PaymentResponse } from '../../models/payment-response.model';
import { PendingPayment } from '../../models/pending-payment.model';
import { CpfValidators } from '../../utils/cpf-validators';
import { PixStep } from '../../enums/pix-step.enum';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { PaymentStatusUtil } from '../../utils/payment-status.util';
import { ApiErrorCode } from '../../../enums/api-error-code.enum';
import { ToastService } from '../../../services/toast.service';
import { FormFieldErrorComponent } from '../../../components/form-field-error/form-field-error.component';

const PIX_EXPIRATION_SECONDS = 10 * 60;

@Component({
  standalone: true,
  selector: 'app-pix-display',
  templateUrl: './pix-display.component.html',
  styleUrl: './pix-display.component.scss',
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent],
})
export class PixDisplayComponent implements OnInit, OnDestroy {
  public readonly orderId: InputSignal<string> = input<string>('');
  public readonly amount: InputSignal<number> = input<number>(0);
  public readonly giftId: InputSignal<string> = input<string>('');
  public readonly giftName: InputSignal<string> = input<string>('');
  public readonly contributorName: InputSignal<string> = input<string>('');
  public readonly message: InputSignal<string> = input<string>('');
  public readonly resumePayment: InputSignal<PendingPayment | null> = input<PendingPayment | null>(null);
  public readonly paymentApproved: OutputEmitterRef<void> = output<void>();
  public readonly paymentResolved: OutputEmitterRef<PaymentResult> = output<PaymentResult>();
  public readonly pixReady: OutputEmitterRef<PaymentResponse> = output<PaymentResponse>();
  public readonly cancelled: OutputEmitterRef<void> = output<void>();
  public readonly retryRequested: OutputEmitterRef<void> = output<void>();

  public readonly PixStep: typeof PixStep = PixStep;
  public readonly ApiErrorCode: typeof ApiErrorCode = ApiErrorCode;

  public readonly pixStep: WritableSignal<PixStep> = signal(PixStep.Form);
  public readonly qrCode: WritableSignal<string> = signal('');
  public readonly qrCodeBase64: WritableSignal<string> = signal('');
  public readonly mpOrderId: WritableSignal<string> = signal('');
  public readonly error: WritableSignal<string> = signal('');
  public readonly errorMessage: WritableSignal<string> = signal('');
  public readonly terminalFailure: WritableSignal<boolean> = signal(false);
  public readonly expired: WritableSignal<boolean> = signal(false);
  public readonly copied: WritableSignal<boolean> = signal(false);
  public readonly remainingSeconds: WritableSignal<number> = signal(PIX_EXPIRATION_SECONDS);
  public recoverableStatusError: boolean = false;

  public readonly formattedCountdown = computed((): string => {
    const total = Math.max(this.remainingSeconds(), 0);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  public readonly payerForm: FormGroup;

  private pollingTimeout: number = 0;
  private pollingAttempt: number = 0;
  private countdownInterval: number = 0;
  private awaitingPixResponse: boolean = false;
  private awaitingStatusCheck: boolean = false;

  public constructor(public readonly paymentService: PaymentService, public readonly fb: FormBuilder, public readonly toastService: ToastService) {
    this.payerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, CpfValidators.validator()]],
    });

    effect((): void => this.handlePaymentState(this.paymentService.paymentState()), { allowSignalWrites: true });
    effect((): void => this.handleStatusState(this.paymentService.statusState()), { allowSignalWrites: true });
  }

  public ngOnInit(): void {
    const pendingPayment: PendingPayment | null = this.resumePayment();

    if (!pendingPayment || pendingPayment.method !== PaymentMethod.Pix)
      return;

    if (pendingPayment.orderId !== this.orderId() || pendingPayment.gift.id !== this.giftId())
      return;

    this.mpOrderId.set(pendingPayment.mpOrderId ?? '');
    this.qrCode.set(pendingPayment.qrCode ?? '');
    this.qrCodeBase64.set(pendingPayment.qrCodeBase64 ?? '');
    this.pixStep.set(this.qrCode() || this.qrCodeBase64() ? PixStep.Qr : PixStep.Loading);

    if (pendingPayment.expiresAt)
      this.resetCountdown(pendingPayment.expiresAt);

    if (this.remainingSeconds() <= 0) {
      this.expired.set(true);
      return;
    }

    this.startPolling();
    this.startCountdown();
    this.verifyNow();
  }

  private showError(code: string, detail: string): void {
    this.error.set(code);
    this.errorMessage.set(detail);
    this.toastService.error(detail, 'Erro no pagamento');
  }

  public onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    this.payerForm.get('cpf')!.setValue(this.formatCpf(digits), { emitEvent: false });
  }

  private formatCpf(digits: string): string {
    if (digits.length > 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;

    if (digits.length > 6)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

    if (digits.length > 3)
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;

    return digits;
  }

  public generatePix(): void {
    if (this.awaitingPixResponse || this.pixStep() === PixStep.Loading)
      return;

    if (this.payerForm.invalid) {
      this.payerForm.markAllAsTouched();
      return;
    }

    this.pixStep.set(PixStep.Loading);
    this.error.set('');
    this.errorMessage.set('');
    this.terminalFailure.set(false);
    this.recoverableStatusError = false;

    const rawCpf = (this.payerForm.value.cpf as string).replace(/\D/g, '');

    const dto: PixPaymentDto = {
      giftId: this.giftId(),
      contributorName: this.contributorName(),
      message: this.message(),
      orderId: this.orderId(),
      amount: this.amount(),
      payerEmail: this.payerForm.value.email as string,
      payerDocType: 'CPF',
      payerDocNumber: rawCpf,
    };

    this.awaitingPixResponse = true;
    this.paymentService.payWithPix(dto);
  }

  private handlePaymentState(state: PaymentState): void {
    if (state.submitting || !this.awaitingPixResponse)
      return;

    this.awaitingPixResponse = false;

    if (state.error) {
      this.showError(ApiErrorCode.ProviderError, state.error);

      if (!state.uncertainFailure)
        this.retryRequested.emit();

      this.pixStep.set(PixStep.Form);
      return;
    }

    if (!state.hasResponse)
      return;

    const response = state.response;

    const qrCode: string = response.qrCode ?? response.pixQrCode ?? '';
    const qrCodeBase64: string = response.qrCodeBase64 ?? '';

    if (qrCode || qrCodeBase64) {
      this.mpOrderId.set(response.mpOrderId ?? '');
      this.qrCode.set(qrCode);
      this.qrCodeBase64.set(qrCodeBase64);
      this.error.set('');
      this.errorMessage.set('');
      this.recoverableStatusError = false;
      this.pixStep.set(PixStep.Qr);
      this.pixReady.emit(response);
      this.pollingAttempt = 0;
      this.resetCountdown(response.expiresAt);

      if (this.remainingSeconds() <= 0) {
        this.expired.set(true);
        return;
      }

      this.startPolling();
      this.startCountdown();
      return;
    }

    this.showError(response.errorCode ?? ApiErrorCode.ProviderError, 'Erro ao gerar o PIX. Tente novamente.');
    this.retryRequested.emit();
    this.pixStep.set(PixStep.Form);
  }

  private handleStatusState(state: PaymentStatusState): void {
    if (!this.awaitingStatusCheck)
      return;

    if (state.orderId !== this.orderId())
      return;

    if (!state.hasResponse && !state.error)
      return;

    this.awaitingStatusCheck = false;

    if (state.error) {
      if (this.qrCode() || this.qrCodeBase64())
        return;

      this.stopPolling();
      this.recoverableStatusError = true;
      this.pixStep.set(PixStep.Qr);
      this.showError(ApiErrorCode.ProviderError, state.error);
      return;
    }

    if (state.hasResponse && PaymentStatusUtil.isApproved(state.response.status)) {
      this.stopPolling();
      this.paymentResolved.emit(this.toPaymentResult(state.response));
      this.paymentApproved.emit();
      return;
    }

    if (state.hasResponse && PaymentStatusUtil.isFinalFailure(state.response.status)) {
      this.stopPolling();
      this.terminalFailure.set(true);
      this.showError(state.response.errorCode ?? ApiErrorCode.PixRejected, 'Não foi possível concluir este PIX. Gere um novo código para tentar novamente.');
      return;
    }

    if (!state.hasResponse || !PaymentStatusUtil.isPending(state.response.status))
      return;

    const response: PaymentResponse = state.response;
    const qrCode: string = response.qrCode ?? response.pixQrCode ?? '';
    const qrCodeBase64: string = response.qrCodeBase64 ?? '';
    const hasPixCode: boolean = Boolean(qrCode || qrCodeBase64 || this.qrCode() || this.qrCodeBase64());

    if (!hasPixCode) {
      this.stopPolling();
      this.recoverableStatusError = true;
      this.pixStep.set(PixStep.Qr);
      this.showError(ApiErrorCode.ProviderError, 'Não foi possível recuperar o código PIX. Informe os dados novamente para tentar com o mesmo pedido.');
      return;
    }

    if (response.mpOrderId)
      this.mpOrderId.set(response.mpOrderId);

    if (qrCode)
      this.qrCode.set(qrCode);

    if (qrCodeBase64)
      this.qrCodeBase64.set(qrCodeBase64);

    if (response.expiresAt)
      this.resetCountdown(response.expiresAt);

    this.error.set('');
    this.errorMessage.set('');
    this.recoverableStatusError = false;
    this.pixStep.set(PixStep.Qr);
    this.pixReady.emit(response);
  }

  private startPolling(): void {
    if (this.pollingTimeout !== 0)
      return;

    this.scheduleNextPoll();
  }

  private scheduleNextPoll(): void {
    const delay: number = this.pollingAttempt === 0 ? 5000 : this.pollingAttempt === 1 ? 10000 : 15000;
    this.pollingTimeout = window.setTimeout((): void => {
      this.pollingTimeout = 0;

      if (document.hidden)
        return;

      if (!this.awaitingStatusCheck) {
        this.awaitingStatusCheck = true;
        this.paymentService.loadOrder(this.orderId());
        this.pollingAttempt += 1;
      }

      this.scheduleNextPoll();
    }, delay);
  }

  private startCountdown(): void {
    this.countdownInterval = window.setInterval((): void => {
      this.remainingSeconds.update((seconds: number): number => seconds - 1);
      if (this.remainingSeconds() <= 0) {
        this.stopPolling();
        this.expired.set(true);
      }
    }, 1000);
  }

  private resetCountdown(expiresAt?: string): void {
    const expirationTimestamp: number = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
    const resolvedTimestamp: number = Number.isFinite(expirationTimestamp) ? expirationTimestamp : Date.now() + PIX_EXPIRATION_SECONDS * 1000;
    const secondsLeft: number = Math.floor((resolvedTimestamp - Date.now()) / 1000);
    this.remainingSeconds.set(Math.max(secondsLeft, 0));
  }

  public retryPix(): void {
    this.stopPolling();
    this.awaitingStatusCheck = false;
    this.pollingAttempt = 0;
    this.retryRequested.emit();
    this.pixStep.set(PixStep.Form);
    this.expired.set(false);
    this.terminalFailure.set(false);
    this.recoverableStatusError = false;
    this.error.set('');
    this.errorMessage.set('');
    this.qrCode.set('');
    this.qrCodeBase64.set('');
    this.mpOrderId.set('');
  }

  public retryPixLookup(): void {
    this.stopPolling();
    this.awaitingStatusCheck = false;
    this.pollingAttempt = 0;
    this.pixStep.set(PixStep.Form);
    this.expired.set(false);
    this.terminalFailure.set(false);
    this.recoverableStatusError = false;
    this.error.set('');
    this.errorMessage.set('');
    this.qrCode.set('');
    this.qrCodeBase64.set('');
    this.mpOrderId.set('');
  }

  public cancel(): void {
    if (this.paymentService.paymentState().submitting)
      return;

    this.stopPolling();
    this.cancelled.emit();
  }

  public verifyNow(): void {
    if (!this.orderId() || this.awaitingStatusCheck)
      return;

    this.awaitingStatusCheck = true;
    this.paymentService.loadOrder(this.orderId());
  }

  public copyCode(): void {
    navigator.clipboard.writeText(this.qrCode()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  @HostListener('document:visibilitychange')
  public onVisibilityChange(): void {
    if (document.hidden) {
      this.pausePolling();
      return;
    }

    if (this.pixStep() !== PixStep.Qr || this.expired() || this.terminalFailure() || this.recoverableStatusError)
      return;

    this.pollingAttempt = 0;
    this.verifyNow();
    this.startPolling();
  }

  private stopPolling(): void {
    this.pausePolling();

    if (this.countdownInterval !== 0) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = 0;
    }
  }

  private pausePolling(): void {
    if (this.pollingTimeout === 0)
      return;

    clearTimeout(this.pollingTimeout);
    this.pollingTimeout = 0;
  }

  public ngOnDestroy(): void {
    this.stopPolling();
  }

  private toPaymentResult(response: PaymentResponse): PaymentResult {
    return {
      orderId: response.orderId ?? this.orderId(),
      amount: response.amount ?? this.amount(),
      giftId: response.giftId ?? this.giftId(),
      giftName: response.giftName ?? this.giftName(),
      contributorName: response.contributorName ?? this.contributorName(),
      message: response.message ?? this.message(),
      method: PaymentMethod.Pix,
      status: response.status,
      statusDetail: response.statusDetail,
      mpOrderId: response.mpOrderId ?? this.mpOrderId(),
      paidAt: response.paidAt ?? response.updatedAt ?? new Date().toISOString(),
      contributionCreated: response.contributionCreated ?? false,
    };
  }
}
