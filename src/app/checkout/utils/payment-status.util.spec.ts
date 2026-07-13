import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentStatusUtil } from './payment-status.util';

describe('PaymentStatusUtil', () => {
  it('considera action_required e estados de processamento como pendentes', () => {
    expect(PaymentStatusUtil.isPending(PaymentStatus.ActionRequired)).toBe(true);
    expect(PaymentStatusUtil.isPending(PaymentStatus.Created)).toBe(true);
    expect(PaymentStatusUtil.isPending(PaymentStatus.Processing)).toBe(true);
    expect(PaymentStatusUtil.isPending(PaymentStatus.InMediation)).toBe(true);
  });

  it('considera processed como aprovado', () => {
    expect(PaymentStatusUtil.isApproved(PaymentStatus.Processed)).toBe(true);
  });

  it('considera partially_refunded e aliases finais como falha final', () => {
    expect(PaymentStatusUtil.isFinalFailure(PaymentStatus.PartiallyRefunded)).toBe(true);
    expect(PaymentStatusUtil.isFinalFailure(PaymentStatus.Failed)).toBe(true);
    expect(PaymentStatusUtil.isFinalFailure(PaymentStatus.Canceled)).toBe(true);
    expect(PaymentStatusUtil.label(PaymentStatus.PartiallyRefunded)).toBe('Parcialmente estornado');
  });
});
