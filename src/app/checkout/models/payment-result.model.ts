import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface PaymentResult {
  orderId: string;
  amount: number;
  giftId: string;
  giftName: string;
  contributorName: string;
  message: string;
  method: PaymentMethod;
  status: PaymentStatus;
  statusDetail?: string;
  mpOrderId?: string;
  paidAt: string;
  contributionCreated: boolean;
}
