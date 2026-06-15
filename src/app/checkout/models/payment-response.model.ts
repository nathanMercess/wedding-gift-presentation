export interface PaymentResponse {
  status: 'approved' | 'rejected' | 'pending' | 'in_process' | 'error';
  statusDetail?: string;
  mpOrderId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  message?: string;
}
