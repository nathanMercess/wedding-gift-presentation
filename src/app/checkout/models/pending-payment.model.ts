import { Gift } from '../../models/gift.model';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface PendingPayment {
  orderId: string;
  gift: Gift;
  amount: number;
  contributorName: string;
  message: string;
  method: PaymentMethod;
  status: PaymentStatus;
  statusDetail?: string;
  mpOrderId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  contributionCreated: boolean;
}
