import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { PixPaymentDto } from '../../models/pix-payment-dto.model';

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
  @Input() orderId = '';
  @Input() amount = 0;

  /** Internal step: collect payer data first, then show QR */
  pixStep: 'form' | 'loading' | 'qr' = 'form';

  qrCode = '';
  qrCodeBase64 = '';
  mpOrderId = '';
  error = '';
  expired = false;
  copied = false;

  readonly payerForm: FormGroup;

  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private expirationTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) {
    this.payerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, cpfValidator()]]
    });
  }

  onCpfInput(event: Event): void {
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

  generatePix(): void {
    if (this.payerForm.invalid) {
      this.payerForm.markAllAsTouched();
      return;
    }

    this.pixStep = 'loading';
    this.error = '';
    this.cdr.markForCheck();

    const rawCpf = (this.payerForm.value.cpf as string).replace(/\D/g, '');

    const dto: PixPaymentDto = {
      orderId: this.orderId,
      amount: this.amount,
      payerEmail: this.payerForm.value.email as string,
      payerDocType: 'CPF',
      payerDocNumber: rawCpf
    };

    this.paymentService
      .payWithPix(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.mpOrderId && response.qrCodeBase64) {
            this.mpOrderId = response.mpOrderId;
            this.qrCode = response.qrCode ?? '';
            this.qrCodeBase64 = response.qrCodeBase64;
            this.pixStep = 'qr';
            this.cdr.markForCheck();
            this.startPolling();
            this.startExpirationTimeout();
          } else {
            this.error = response.message ?? 'Erro ao gerar o PIX. Tente novamente.';
            this.pixStep = 'form';
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.error = 'Erro ao gerar o PIX. Tente novamente.';
          this.pixStep = 'form';
          this.cdr.markForCheck();
        }
      });
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.paymentService.getStatus(this.mpOrderId)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            if (response.status === 'approved') {
              this.stopPolling();
              this.router.navigate(['/sucesso']);
            } else if (response.status === 'rejected') {
              this.stopPolling();
              this.error = response.message ?? 'Pagamento rejeitado.';
              this.cdr.markForCheck();
            }
          },
          error: () => {
            // Transient polling error — retries on the next interval
          }
        });
    }, 5000);
  }

  private startExpirationTimeout(): void {
    this.expirationTimeout = setTimeout(() => {
      this.stopPolling();
      this.expired = true;
      this.cdr.markForCheck();
    }, 10 * 60 * 1000);
  }

  private stopPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.expirationTimeout !== null) {
      clearTimeout(this.expirationTimeout);
      this.expirationTimeout = null;
    }
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.qrCode).then(() => {
      this.copied = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.copied = false;
        this.cdr.markForCheck();
      }, 2000);
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
