import { PaymentMethod } from '../enums/payment-method.enum';

export interface CardPaymentDto {
  giftId: string;
  contributorName: string;
  message?: string;
  orderId: string;
  amount: number;
  cardToken: string;
  paymentMethodId: string;
  issuerId?: string;
  deviceId?: string;
  installments: number;
  method: PaymentMethod.CreditCard;
  payerEmail: string;
  payerDocType: string;
  payerDocNumber: string;
}
