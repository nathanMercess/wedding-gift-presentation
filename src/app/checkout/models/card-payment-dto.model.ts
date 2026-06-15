export interface CardPaymentDto {
  orderId: string;
  amount: number;
  cardToken: string;
  paymentMethodId: string;
  issuerId?: string;
  installments: number;
  cardType: 'credit_card' | 'debit_card';
  payerEmail: string;
  payerDocType: string;
  payerDocNumber: string;
}
