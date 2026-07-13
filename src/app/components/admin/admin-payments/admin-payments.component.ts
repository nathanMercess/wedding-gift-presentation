import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentStatus } from '../../../checkout/enums/payment-status.enum';
import { PaymentStatusUtil } from '../../../checkout/utils/payment-status.util';
import { AdminPayment } from '../../../models/admin-payment.model';
import { AdminOperationsService } from '../../../services/admin-operations.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { UserRole } from '../../../enums/user-role.enum';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  standalone: true,
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPaymentsComponent implements OnInit {
  public readonly PaymentStatus: typeof PaymentStatus = PaymentStatus;
  public readonly statusOptions: Array<PaymentStatus | null> = [null, PaymentStatus.Created, PaymentStatus.Approved, PaymentStatus.Processed, PaymentStatus.Pending, PaymentStatus.InProcess, PaymentStatus.Processing, PaymentStatus.ActionRequired, PaymentStatus.InMediation, PaymentStatus.Rejected, PaymentStatus.Failed, PaymentStatus.Expired, PaymentStatus.Cancelled, PaymentStatus.Canceled, PaymentStatus.Error, PaymentStatus.Refunded, PaymentStatus.PartiallyRefunded, PaymentStatus.ChargedBack];
  public selectedStatus: PaymentStatus | null = null;
  public selectedMethod: string = '';
  public currentPage: number = 1;
  public showRefundConfirm: boolean = false;
  public paymentPendingRefund: AdminPayment | null = null;
  public refundIdempotencyKey: string = '';

  public constructor(public readonly operations: AdminOperationsService, public readonly toast: ToastService, public readonly auth: AuthService) {}

  public get isSuperAdmin(): boolean {
    return this.auth.hasRole(UserRole.SuperAdmin);
  }

  public ngOnInit(): void {
    this.load();
  }

  public load(page: number = 1): void {
    this.currentPage = page;
    this.operations.loadPayments({ status: this.selectedStatus ?? undefined, method: this.selectedMethod || undefined, page, pageSize: 20 });
  }

  public requestRefund(payment: AdminPayment): void {
    if (this.operations.state().actionLoading)
      return;

    if (this.paymentPendingRefund?.orderId !== payment.orderId || !this.refundIdempotencyKey)
      this.refundIdempotencyKey = crypto.randomUUID();

    this.paymentPendingRefund = payment;
    this.showRefundConfirm = true;
  }

  public confirmRefund(): void {
    if (this.operations.state().actionLoading)
      return;

    const payment: AdminPayment | null = this.paymentPendingRefund;
    this.showRefundConfirm = false;

    if (!payment || !this.refundIdempotencyKey)
      return;

    this.operations.refundPayment(payment, this.refundIdempotencyKey, (): void => {
      this.paymentPendingRefund = null;
      this.refundIdempotencyKey = '';
      this.toast.success('Estorno solicitado com sucesso.');
    });
  }

  public cancelRefund(): void {
    this.showRefundConfirm = false;
    this.paymentPendingRefund = null;
    this.refundIdempotencyKey = '';
  }

  public canRefund(payment: AdminPayment): boolean {
    return this.isSuperAdmin && PaymentStatusUtil.isApproved(payment.status) && payment.contributionCreated;
  }

  public statusLabel(status: PaymentStatus | null): string {
    if (!status)
      return 'Todos';

    return PaymentStatusUtil.label(status);
  }

  public trackByPayment(_: number, payment: AdminPayment): string {
    return payment.orderId;
  }
}
