export interface PaymentResponse {
  status: 'approved' | 'rejected' | 'pending' | 'in_process' | 'error'| 'processed';
  statusDetail?: string;
  mpOrderId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  message?: string;
}
