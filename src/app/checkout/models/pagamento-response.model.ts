export interface PaymentResponse {
  status: 'approved' | 'declined' | 'pending' | 'error';
  nsu?: string;
  brCode?: string;
  message?: string;
}
