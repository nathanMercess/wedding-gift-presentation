import { PaymentResponse } from './payment-response.model';

export interface PaymentState {
  submitting: boolean;
  hasResponse: boolean;
  response: PaymentResponse;
  error: string;
}
