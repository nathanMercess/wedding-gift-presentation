import { PaymentResponse } from './payment-response.model';

export interface PaymentState {
  submitting: boolean;
  response: PaymentResponse | null;
  error: string;
}
