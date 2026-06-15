export interface CardData {
  cardNumber: string;
  expirationMonth: string; // format: '01' to '12'
  expirationYear: string;  // format: 'YY' (two digits)
  cvv: string;
}
