import { Component, InputSignal, OnDestroy, OnInit, OutputEmitterRef, WritableSignal, computed, effect, input, output, signal } from '@angular/core';
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

  public readonly PixStep: typeof PixStep = PixStep;
  public readonly ApiErrorCode: typeof ApiErrorCode = ApiErrorCode;

  public readonly pixStep: WritableSignal<PixStep> = signal(PixStep.Form);
  public readonly qrCode: WritableSignal<string> = signal('');
  public readonly qrCodeBase64: WritableSignal<string> = signal('');
  public readonly mpOrderId: WritableSignal<string> = signal('');
  public readonly error: WritableSignal<string> = signal('');
  public readonly expired: WritableSignal<boolean> = signal(false);
  public readonly copied: WritableSignal<boolean> = signal(false);
  public readonly remainingSeconds: WritableSignal<number> = signal(PIX_EXPIRATION_SECONDS);

  public readonly formattedCountdown = computed((): string => {
    const total = Math.max(this.remainingSeconds(), 0);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  public readonly payerForm: FormGroup;

  private pollingInterval: number = 0;
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

    if (!pendingPayment || pendingPayment.method !== PaymentMethod.Pix || !pendingPayment.mpOrderId)
      return;

    this.mpOrderId.set(pendingPayment.mpOrderId);
    this.qrCode.set(pendingPayment.qrCode ?? '');
    this.qrCodeBase64.set(pendingPayment.qrCodeBase64 ?? '');
    this.pixStep.set(PixStep.Qr);

    if (pendingPayment.expiresAt) {
      const secondsLeft: number = Math.floor((new Date(pendingPayment.expiresAt).getTime() - Date.now()) / 1000);
      this.remainingSeconds.set(Math.max(secondsLeft, 0));
    }

    if (this.remainingSeconds() <= 0) {
      this.expired.set(true);
      return;
    }

    this.startPolling();
    this.startCountdown(false);
  }

  private showError(code: string, detail: string): void {
    this.error.set(code);
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
      this.pixStep.set(PixStep.Form);
      return;
    }

    if (!state.hasResponse)
      return;

    const response = state.response;

    const qrCode: string = response.qrCode ?? response.pixQrCode ?? '';
    const qrCodeBase64: string = response.qrCodeBase64 ?? '';

    if (response.mpOrderId && (qrCode || qrCodeBase64)) {
      this.mpOrderId.set(response.mpOrderId);
      this.qrCode.set(qrCode);
      this.qrCodeBase64.set(qrCodeBase64);
      this.error.set('');
      this.pixStep.set(PixStep.Qr);
      this.pixReady.emit(response);
      this.startPolling();
      this.startCountdown(true);
      return;
    }

    this.showError(response.errorCode ?? ApiErrorCode.ProviderError, 'Erro ao gerar o PIX. Tente novamente.');
    this.pixStep.set(PixStep.Form);
  }

  private handleStatusState(state: PaymentStatusState): void {
    if (!this.awaitingStatusCheck)
      return;

    this.awaitingStatusCheck = false;

    if (state.hasResponse && state.response.status === PaymentStatus.Approved) {
      this.stopPolling();
      this.paymentResolved.emit(this.toPaymentResult(state.response));
      this.paymentApproved.emit();
      return;
    }

    if (state.hasResponse && PaymentStatusUtil.isFinalFailure(state.response.status)) {
      this.stopPolling();
      this.showError(state.response.errorCode ?? ApiErrorCode.PixRejected, 'Pagamento PIX rejeitado. Tente novamente.');
      return;
    }

    if (state.hasResponse && (state.response.status === PaymentStatus.Pending || state.response.status === PaymentStatus.InProcess)) {
      this.toastService.info('Ainda estamos aguardando a confirmacao do PIX.', 'Pagamento pendente');
    }
  }

  private startPolling(): void {
    this.pollingInterval = window.setInterval((): void => {
      if (this.awaitingStatusCheck)
        return;

      this.awaitingStatusCheck = true;
      this.paymentService.checkStatus(this.mpOrderId());
    }, 5000);
  }

  private startCountdown(reset: boolean): void {
    if (reset)
      this.remainingSeconds.set(PIX_EXPIRATION_SECONDS);

    this.countdownInterval = window.setInterval((): void => {
      this.remainingSeconds.update(s => s - 1);
      if (this.remainingSeconds() <= 0) {
        this.stopPolling();
        this.expired.set(true);
      }
    }, 1000);
  }

  public retryPix(): void {
    this.pixStep.set(PixStep.Form);
    this.expired.set(false);
    this.error.set('');
    this.qrCode.set('');
    this.qrCodeBase64.set('');
    this.mpOrderId.set('');
  }

  public cancel(): void {
    this.stopPolling();
    this.cancelled.emit();
  }

  public verifyNow(): void {
    if (!this.mpOrderId() || this.awaitingStatusCheck)
      return;

    this.awaitingStatusCheck = true;
    this.paymentService.checkStatus(this.mpOrderId());
  }

  public copyCode(): void {
    navigator.clipboard.writeText(this.qrCode()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  private stopPolling(): void {
    if (this.pollingInterval !== 0) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = 0;
    }
    if (this.countdownInterval !== 0) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = 0;
    }
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
