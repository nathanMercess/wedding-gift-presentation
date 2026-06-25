import { Component, InputSignal, OnDestroy, OutputEmitterRef, WritableSignal, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { PaymentState } from '../../models/payment-state.model';
import { PaymentStatusState } from '../../models/payment-status-state.model';
import { PixPaymentDto } from '../../models/pix-payment-dto.model';
import { CpfValidators } from '../../utils/cpf-validators';
import { PixStep } from '../../enums/pix-step.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
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
export class PixDisplayComponent implements OnDestroy {
  public readonly orderId: InputSignal<string> = input<string>('');
  public readonly amount: InputSignal<number> = input<number>(0);
  public readonly giftId: InputSignal<string> = input<string>('');
  public readonly contributorName: InputSignal<string> = input<string>('');
  public readonly message: InputSignal<string> = input<string>('');
  public readonly paymentApproved: OutputEmitterRef<void> = output<void>();
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

  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
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

    if (!state.response)
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
      this.startPolling();
      this.startCountdown();
      return;
    }

    this.showError(response.errorCode ?? ApiErrorCode.ProviderError, 'Erro ao gerar o PIX. Tente novamente.');
    this.pixStep.set(PixStep.Form);
  }

  private handleStatusState(state: PaymentStatusState): void {
    if (!this.awaitingStatusCheck)
      return;

    this.awaitingStatusCheck = false;

    if (state.response?.status === PaymentStatus.Approved) {
      this.stopPolling();
      this.paymentApproved.emit();
      return;
    }

    if (state.response?.status === PaymentStatus.Rejected) {
      this.stopPolling();
      this.showError(state.response.errorCode ?? ApiErrorCode.PixRejected, 'Pagamento PIX rejeitado. Tente novamente.');
    }
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.awaitingStatusCheck = true;
      this.paymentService.checkStatus(this.mpOrderId());
    }, 5000);
  }

  private startCountdown(): void {
    this.remainingSeconds.set(PIX_EXPIRATION_SECONDS);
    this.countdownInterval = setInterval(() => {
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

  public copyCode(): void {
    navigator.clipboard.writeText(this.qrCode()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  private stopPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  public ngOnDestroy(): void {
    this.stopPolling();
  }
}
