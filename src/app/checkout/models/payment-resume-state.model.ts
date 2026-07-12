import { PendingPayment } from './pending-payment.model';

export interface PaymentResumeState {
  pending: PendingPayment | null;
}
