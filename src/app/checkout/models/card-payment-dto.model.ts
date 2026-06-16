export interface CardPaymentDto {
  orderId: string;
  amount: number;
  cardToken: string;
  paymentMethodId: string;
  installments: number;
  method: 'credit_card' | 'debit_card'; 
  payerEmail: string;
  payerDocType: string;
  payerDocNumber: string;
}