import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentResponse } from '../models/payment-response.model';

export const EMPTY_PAYMENT_RESPONSE: PaymentResponse = {
  status: PaymentStatus.Error,
};
