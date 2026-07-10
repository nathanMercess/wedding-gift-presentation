import { PaymentMethod } from '../enums/payment-method.enum';

export interface CardBrickConfig {
  amount: number;
  orderId: string;
  giftId: string;
  contributorName: string;
  message: string;
  cardType: PaymentMethod.CreditCard | PaymentMethod.DebitCard;
  payerEmail: string;
  maxInstallments: number;
}
