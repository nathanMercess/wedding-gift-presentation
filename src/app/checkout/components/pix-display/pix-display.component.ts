import { ChangeDetectionStrategy, ChangeDetectorRef, Component, InputSignal, OnDestroy, OutputEmitterRef, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { PaymentState } from '../../models/payment-state.model';
import { PaymentStatusState } from '../../models/payment-status-state.model';
import { PixPaymentDto } from '../../models/pix-payment-dto.model';

const PIX_EXPIRATION_SECONDS = 10 * 60;

function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const digits = (control.value as string)?.replace(/\D/g, '') ?? '';
    return digits.length === 11 ? null : { invalidCpf: true };
  };
}

@Component({
  selector: 'app-pix-display',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pix-display.component.html',
  styleUrl: './pix-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixDisplayComponent implements OnDestroy {
  public readonly orderId: InputSignal<string> = input<string>('');
  public readonly amount: InputSignal<number> = input<number>(0);
  public readonly giftId: InputSignal<string> = input<string>('');
  public readonly contributorName: InputSignal<string> = input<string>('');
  public readonly message: InputSignal<string> = input<string>('');
  public readonly paymentApproved: OutputEmitterRef<void> = output<void>();

  /** Internal step: collect payer data first, then show QR */
  public pixStep: 'form' | 'loading' | 'qr' = 'form';

  public qrCode: string = '';
  public qrCodeBase64: string = '';
  public mpOrderId: string = '';
  public error: string = '';
  public expired: boolean = false;
  public copied: boolean = false;
  public remainingSeconds: number = PIX_EXPIRATION_SECONDS;

  public readonly payerForm: FormGroup;

  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private awaitingPixResponse: boolean = false;
  private awaitingStatusCheck: boolean = false;

  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  public constructor(public readonly paymentService: PaymentService, public readonly fb: FormBuilder) {
    this.payerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, cpfValidator()]]
    });

    effect((): void => this.handlePaymentState(this.paymentService.paymentState()));
    effect((): void => this.handleStatusState(this.paymentService.statusState()));
  }

  public onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    this.payerForm.get('cpf')!.setValue(formatted, { emitEvent: false });
  }

  public generatePix(): void {
    if (this.payerForm.invalid) {
      this.payerForm.markAllAsTouched();
      return;
    }

    this.pixStep = 'loading';
    this.error = '';
    this.cdr.markForCheck();

    const rawCpf = (this.payerForm.value.cpf as string).replace(/\D/g, '');

    const dto: PixPaymentDto = {
      giftId: this.giftId(),
      contributorName: this.contributorName(),
      message: this.message(),
      orderId: this.orderId(),
      amount: this.amount(),
      payerEmail: this.payerForm.value.email as string,
      payerDocType: 'CPF',
      payerDocNumber: rawCpf
    };

    this.awaitingPixResponse = true;
    this.paymentService.payWithPix(dto);
  }

  private handlePaymentState(state: PaymentState): void {
    if (state.submitting || !this.awaitingPixResponse) return;
    this.awaitingPixResponse = false;

    if (state.response) {
      const response = state.response;
      if (response.mpOrderId && response.qrCodeBase64) {
        this.mpOrderId = response.mpOrderId;
        this.qrCode = response.qrCode ?? '';
        this.qrCodeBase64 = response.qrCodeBase64;
        this.pixStep = 'qr';
        this.cdr.markForCheck();
        this.startPolling();
        this.startCountdown();
      } else {
        this.error = response.message ?? 'Erro ao gerar o PIX. Tente novamente.';
        this.pixStep = 'form';
        this.cdr.markForCheck();
      }
    } else if (state.error) {
      this.error = state.error;
      this.pixStep = 'form';
      this.cdr.markForCheck();
    }
  }

  private handleStatusState(state: PaymentStatusState): void {
    if (!this.awaitingStatusCheck) return;
    this.awaitingStatusCheck = false;

    if (state.response?.status === 'approved') {
      this.stopPolling();
      this.paymentApproved.emit();
    } else if (state.response?.status === 'rejected') {
      this.stopPolling();
      this.error = state.response.message ?? 'Pagamento rejeitado.';
      this.cdr.markForCheck();
    }
    // status pendente ou erro transitório: mantém o polling até a próxima tentativa
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.awaitingStatusCheck = true;
      this.paymentService.checkStatus(this.mpOrderId);
    }, 5000);
  }

  private startCountdown(): void {
    this.remainingSeconds = PIX_EXPIRATION_SECONDS;
    this.countdownInterval = setInterval(() => {
      this.remainingSeconds -= 1;
      if (this.remainingSeconds <= 0) {
        this.stopPolling();
        this.expired = true;
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  public get formattedCountdown(): string {
    const minutes = Math.floor(Math.max(this.remainingSeconds, 0) / 60);
    const seconds = Math.max(this.remainingSeconds, 0) % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  public retryPix(): void {
    this.pixStep = 'form';
    this.expired = false;
    this.error = '';
    this.qrCode = '';
    this.qrCodeBase64 = '';
    this.mpOrderId = '';
    this.cdr.markForCheck();
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

  public copyCode(): void {
    navigator.clipboard.writeText(this.qrCode).then(() => {
      this.copied = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.copied = false;
        this.cdr.markForCheck();
      }, 2000);
    });
  }

  public ngOnDestroy(): void {
    this.stopPolling();
  }
}
