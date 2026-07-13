import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethod } from '../../checkout/enums/payment-method.enum';
import { PaymentStatus } from '../../checkout/enums/payment-status.enum';
import { PaymentResult } from '../../checkout/models/payment-result.model';
import { GiftSuccessStepComponent } from './gift-success-step.component';

abstract class GiftSuccessTestData {
  public static result(status: PaymentStatus): PaymentResult {
    return { orderId: 'order-1', amount: 100, giftId: 'gift-1', giftName: 'Presente', contributorName: 'Convidado', message: '', method: PaymentMethod.CreditCard, status, paidAt: new Date().toISOString(), contributionCreated: status === PaymentStatus.Approved };
  }
}

describe('GiftSuccessStepComponent', () => {
  let fixture: ComponentFixture<GiftSuccessStepComponent>;
  let component: GiftSuccessStepComponent;

  beforeEach((): void => {
    TestBed.configureTestingModule({ imports: [GiftSuccessStepComponent] });
    fixture = TestBed.createComponent(GiftSuccessStepComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('coupleName', 'David e Maira');
  });

  it('não chama um pagamento pendente de pago ou comprovante', () => {
    fixture.componentRef.setInput('result', GiftSuccessTestData.result(PaymentStatus.InProcess));
    fixture.detectChanges();

    expect(component.isApproved).toBe(false);
    expect(component.amountLabel).toBe('Valor da contribuição');
    expect(component.dateLabel).toBe('Atualizado em');
    expect(component.copyLabel).toBe('Copiar resumo');
    expect(component.receiptFileName).toBe('resumo-order-1.txt');
    expect(component.receiptText).not.toContain('Valor pago');
  });

  it('mantém rótulos de comprovante para pagamento aprovado', () => {
    fixture.componentRef.setInput('result', GiftSuccessTestData.result(PaymentStatus.Processed));
    fixture.detectChanges();

    expect(component.isApproved).toBe(true);
    expect(component.amountLabel).toBe('Valor pago');
    expect(component.copyLabel).toBe('Copiar comprovante');
    expect(component.receiptFileName).toBe('comprovante-order-1.txt');
  });
});
