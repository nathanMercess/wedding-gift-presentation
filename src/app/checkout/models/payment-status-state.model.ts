import { PaymentResponse } from './payment-response.model';

export interface PaymentStatusState {
  hasResponse: boolean;
  response: PaymentResponse;
  error: string;
}
