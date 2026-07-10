import { CREDIT_CARD_FEES, CREDIT_CARD_MAX_INSTALLMENTS } from '../constants/credit-card-fees.constant';
import { CreditCardInstallmentFee } from '../models/credit-card-installment-fee.model';

export abstract class CreditCardFeeUtil {
  public static getMaxInstallments(): number {
    return CREDIT_CARD_MAX_INSTALLMENTS;
  }

  public static getTotalFeePercent(installments: number = CREDIT_CARD_MAX_INSTALLMENTS): number {
    const fee: CreditCardInstallmentFee | undefined = CREDIT_CARD_FEES.find((item: CreditCardInstallmentFee): boolean => item.installments === installments);

    if (!fee)
      return 0;

    return fee.installmentFeePercent + fee.saleFeePercent;
  }

  public static calculateGrossAmount(amount: number, installments: number = CREDIT_CARD_MAX_INSTALLMENTS): number {
    const feePercent: number = this.getTotalFeePercent(installments);

    if (amount <= 0)
      return 0;

    if (feePercent <= 0)
      return amount;

    if (feePercent >= 99)
      return amount;

    return Math.round((amount / (1 - feePercent / 100)) * 100) / 100;
  }

  public static calculateInstallmentAmount(amount: number, installments: number = CREDIT_CARD_MAX_INSTALLMENTS): number {
    return Math.round((this.calculateGrossAmount(amount, installments) / installments) * 100) / 100;
  }
}
