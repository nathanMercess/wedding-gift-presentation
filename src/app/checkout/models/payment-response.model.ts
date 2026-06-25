import { PaymentStatus } from '../enums/payment-status.enum';

export interface PaymentResponse {
  status: PaymentStatus;
  statusDetail?: string;
  errorCode?: string;
  mpOrderId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixQrCode?: string;
  contributionCreated?: boolean;
  message?: string;
}
