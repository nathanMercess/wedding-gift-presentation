import { PaymentResponse } from './payment-response.model';

export interface PaymentStatusState {
  orderId: string;
  hasResponse: boolean;
  response: PaymentResponse;
  error: string;
}
