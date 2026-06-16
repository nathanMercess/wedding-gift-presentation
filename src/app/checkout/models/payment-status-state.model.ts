import { PaymentResponse } from './payment-response.model';

export interface PaymentStatusState {
  response: PaymentResponse | null;
  error: string;
}
