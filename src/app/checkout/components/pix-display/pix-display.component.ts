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
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { PixPaymentDto } from '../../models/pix-payment-dto.model';

@Component({
  selector: 'app-pix-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pix-display.component.html',
  styleUrl: './pix-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixDisplayComponent implements OnInit, OnDestroy {
  @Input() orderId = '';
  @Input() amount = 0;
  @Input() payerEmail = '';
  @Input() payerDocType = '';
  @Input() payerDocNumber = '';

  qrCode = '';
  qrCodeBase64 = '';
  mpOrderId = '';
  loading = true;
  error = '';
  expired = false;
  copied = false;

  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private expirationTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.initializePix();
  }

  private initializePix(): void {
    const dto: PixPaymentDto = {
      orderId: this.orderId,
      amount: this.amount,
      payerEmail: this.payerEmail,
      payerDocType: this.payerDocType,
      payerDocNumber: this.payerDocNumber
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
            this.loading = false;
            this.cdr.markForCheck();
            this.startPolling();
            this.startExpirationTimeout();
          } else {
            this.error = response.message ?? 'Error generating PIX. Please try again.';
            this.loading = false;
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.error = 'Error generating PIX. Please try again.';
          this.loading = false;
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
              this.error = response.message ?? 'Payment rejected.';
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
