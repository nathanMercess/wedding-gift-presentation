import { PaymentMethod } from '../enums/payment-method.enum';

export interface CardBrickConfig {
  amount: number;
  orderId: string;
  giftId: string;
  giftName: string;
  contributorName: string;
  message: string;
  cardType: PaymentMethod.CreditCard;
  payerEmail: string;
  maxInstallments: number;
}
