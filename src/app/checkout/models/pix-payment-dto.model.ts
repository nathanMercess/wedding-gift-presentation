export interface PixPaymentDto {
  giftId: string;
  contributorName: string;
  message?: string;
  orderId: string;
  amount: number;
  payerEmail: string;
  payerDocType: string;
  payerDocNumber: string;
}
