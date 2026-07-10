import { PaymentMethod } from '../enums/payment-method.enum';

export interface CardPaymentDto {
  giftId: string;
  contributorName: string;
  message?: string;
  orderId: string;
  amount: number;
  cardToken: string;
  paymentMethodId: string;
  installments: number;
  method: PaymentMethod.CreditCard | PaymentMethod.DebitCard;
  payerEmail: string;
  payerDocType: string;
  payerDocNumber: string;
}
