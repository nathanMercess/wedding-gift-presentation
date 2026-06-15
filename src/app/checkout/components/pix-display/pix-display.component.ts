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
import { QRCodeComponent } from 'angularx-qrcode';
import { PaymentService } from '../../services/pagamento.service';

@Component({
  selector: 'app-pix-display',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './pix-display.component.html',
  styleUrl: './pix-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixDisplayComponent implements OnInit, OnDestroy {
  @Input() orderId = '';
  @Input() totalAmount = 0;

  brCode = '';
  nsu = '';
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
  ) {}

  ngOnInit(): void {
    this.initializePix();
  }

  private initializePix(): void {
    this.paymentService
      .payWithPix({ orderId: this.orderId, amount: this.totalAmount })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.brCode && response.nsu) {
            this.brCode = response.brCode;
            this.nsu = response.nsu;
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
      this.paymentService.getPaymentStatus(this.nsu)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            if (response.status === 'approved') {
              this.stopPolling();
              this.router.navigate(['/sucesso']);
            } else if (response.status === 'declined') {
              this.stopPolling();
              this.error = response.message ?? 'Payment declined.';
              this.cdr.markForCheck();
            }
          },
          error: (_err) => {
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
    navigator.clipboard.writeText(this.brCode).then(() => {
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
