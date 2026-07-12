import { PaymentStatus } from '../enums/payment-status.enum';

export interface PaymentResponse {
  status: PaymentStatus;
  statusDetail?: string;
  errorCode?: string;
  orderId?: string;
  amount?: number;
  giftId?: string;
  giftName?: string;
  contributorName?: string;
  mpOrderId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixQrCode?: string;
  contributionCreated?: boolean;
  paidAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  message?: string;
}
