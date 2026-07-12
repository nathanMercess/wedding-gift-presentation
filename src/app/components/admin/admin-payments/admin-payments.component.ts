import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentStatus } from '../../../checkout/enums/payment-status.enum';
import { AdminPayment } from '../../../models/admin-payment.model';
import { AdminOperationsService } from '../../../services/admin-operations.service';
import { ToastService } from '../../../services/toast.service';
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
  public readonly statusOptions: Array<PaymentStatus | null> = [null, PaymentStatus.Approved, PaymentStatus.Pending, PaymentStatus.InProcess, PaymentStatus.Rejected, PaymentStatus.Expired, PaymentStatus.Refunded, PaymentStatus.ChargedBack];
  public selectedStatus: PaymentStatus | null = null;
  public selectedMethod: string = '';
  public currentPage: number = 1;
  public showRefundConfirm: boolean = false;
  public paymentPendingRefund: AdminPayment | null = null;

  public constructor(public readonly operations: AdminOperationsService, public readonly toast: ToastService) {}

  public ngOnInit(): void {
    this.load();
  }

  public load(page: number = 1): void {
    this.currentPage = page;
    this.operations.loadPayments({ status: this.selectedStatus ?? undefined, method: this.selectedMethod || undefined, page, pageSize: 20 });
  }

  public requestRefund(payment: AdminPayment): void {
    this.paymentPendingRefund = payment;
    this.showRefundConfirm = true;
  }

  public confirmRefund(): void {
    const payment: AdminPayment | null = this.paymentPendingRefund;
    this.showRefundConfirm = false;
    this.paymentPendingRefund = null;

    if (!payment)
      return;

    this.operations.refundPayment(payment, (): void => this.toast.success('Estorno solicitado com sucesso.'));
  }

  public cancelRefund(): void {
    this.showRefundConfirm = false;
    this.paymentPendingRefund = null;
  }

  public canRefund(payment: AdminPayment): boolean {
    return payment.status === PaymentStatus.Approved && payment.contributionCreated;
  }

  public statusLabel(status: PaymentStatus | null): string {
    if (!status)
      return 'Todos';

    if (status === PaymentStatus.Approved)
      return 'Aprovado';

    if (status === PaymentStatus.Pending || status === PaymentStatus.InProcess)
      return 'Pendente';

    if (status === PaymentStatus.Rejected)
      return 'Recusado';

    if (status === PaymentStatus.Expired)
      return 'Expirado';

    if (status === PaymentStatus.Refunded)
      return 'Estornado';

    if (status === PaymentStatus.ChargedBack)
      return 'Chargeback';

    return 'Erro';
  }

  public trackByPayment(_: number, payment: AdminPayment): string {
    return payment.orderId;
  }
}
