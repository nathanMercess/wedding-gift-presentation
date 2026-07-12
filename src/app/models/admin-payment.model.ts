import { PaymentStatus } from '../checkout/enums/payment-status.enum';

export interface AdminPayment {
  orderId: string;
  giftId: string;
  giftName: string;
  amount: number;
  contributorName: string;
  method: string;
  status: PaymentStatus;
  statusDetail?: string;
  message: string;
  mpOrderId?: string;
  mpPaymentId?: string;
  contributionCreated: boolean;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}
