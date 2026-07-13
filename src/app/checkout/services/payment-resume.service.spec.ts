import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PendingPayment } from '../models/pending-payment.model';
import { PaymentResumeService } from './payment-resume.service';

const PAYMENT_RESUME_STORAGE_KEY = 'weddingGift.pendingPayment';

abstract class PaymentResumeTestData {
  public static pending(updatedAt: string = new Date().toISOString()): PendingPayment {
    return {
      orderId: 'order-1',
      gift: { id: 'gift-1', image: '', name: 'Presente', price: 100, raised: 0, total: 100, fullyFunded: false, description: '', available: true, allowPartialContribution: true },
      amount: 100,
      contributorName: 'Convidado',
      message: 'Mensagem',
      method: PaymentMethod.Pix,
      status: PaymentStatus.Pending,
      createdAt: updatedAt,
      updatedAt,
      contributionCreated: false,
    };
  }
}

describe('PaymentResumeService', () => {
  beforeEach((): void => localStorage.clear());

  it('salva, atualiza e limpa somente o pedido correspondente', () => {
    const service: PaymentResumeService = new PaymentResumeService();
    service.save(PaymentResumeTestData.pending());

    expect(service.state().pending?.orderId).toBe('order-1');
    expect(localStorage.getItem(PAYMENT_RESUME_STORAGE_KEY)).toContain('order-1');

    service.update({ status: PaymentStatus.InProcess });
    expect(service.state().pending?.status).toBe(PaymentStatus.InProcess);

    service.clear('outro-pedido');
    expect(service.state().pending).not.toBeNull();

    service.clear('order-1');
    expect(service.state().pending).toBeNull();
    expect(localStorage.getItem(PAYMENT_RESUME_STORAGE_KEY)).toBeNull();
  });

  it('restaura um pagamento válido', () => {
    localStorage.setItem(PAYMENT_RESUME_STORAGE_KEY, JSON.stringify({ ...PaymentResumeTestData.pending(), status: PaymentStatus.ActionRequired }));

    const service: PaymentResumeService = new PaymentResumeService();

    expect(service.state().pending?.gift.id).toBe('gift-1');
    expect(service.state().pending?.status).toBe(PaymentStatus.ActionRequired);
  });

  it('descarta conteúdo sem o schema esperado', () => {
    localStorage.setItem(PAYMENT_RESUME_STORAGE_KEY, JSON.stringify({ orderId: 'order-invalido' }));

    const service: PaymentResumeService = new PaymentResumeService();

    expect(service.state().pending).toBeNull();
    expect(localStorage.getItem(PAYMENT_RESUME_STORAGE_KEY)).toBeNull();
  });

  it('descarta retomada sem atualização há mais de vinte e quatro horas', () => {
    const expiredAt: string = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(PAYMENT_RESUME_STORAGE_KEY, JSON.stringify(PaymentResumeTestData.pending(expiredAt)));

    const service: PaymentResumeService = new PaymentResumeService();

    expect(service.state().pending).toBeNull();
    expect(localStorage.getItem(PAYMENT_RESUME_STORAGE_KEY)).toBeNull();
  });
});
