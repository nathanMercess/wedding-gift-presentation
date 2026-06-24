import { CreditCardInstallmentFee } from '../models/credit-card-installment-fee.model';

export const CREDIT_CARD_FEES: CreditCardInstallmentFee[] = [
  { installments: 1, installmentFeePercent: 4.98, saleFeePercent: 2.99 },
  { installments: 2, installmentFeePercent: 4.52, saleFeePercent: 2.99 },
  { installments: 3, installmentFeePercent: 6.61, saleFeePercent: 2.99 },
  { installments: 4, installmentFeePercent: 8.68, saleFeePercent: 2.99 },
  { installments: 5, installmentFeePercent: 10.65, saleFeePercent: 2.99 },
  { installments: 6, installmentFeePercent: 11.95, saleFeePercent: 2.99 },
  { installments: 7, installmentFeePercent: 13.13, saleFeePercent: 3.09 },
  { installments: 8, installmentFeePercent: 14.39, saleFeePercent: 3.09 },
  { installments: 9, installmentFeePercent: 15.62, saleFeePercent: 3.09 },
  { installments: 10, installmentFeePercent: 15.82, saleFeePercent: 3.09 },
  { installments: 11, installmentFeePercent: 18.01, saleFeePercent: 3.09 },
  { installments: 12, installmentFeePercent: 19.17, saleFeePercent: 3.09 },
];

export const CREDIT_CARD_MAX_INSTALLMENTS = 12;
