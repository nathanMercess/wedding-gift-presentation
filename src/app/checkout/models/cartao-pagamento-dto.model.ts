export interface CardPaymentDtoModel {
  orderId: string;
  cardToken: string;
  amount: number;
  installments: number;
  method: 'credit_card' | 'debit_card';
}
