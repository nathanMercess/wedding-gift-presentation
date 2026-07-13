import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { PaymentStatus } from '../../../checkout/enums/payment-status.enum';
import { AdminOperationsState } from '../../../models/admin-operations-state.model';
import { AdminPayment } from '../../../models/admin-payment.model';
import { AdminOperationsService } from '../../../services/admin-operations.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { AdminPaymentsComponent } from './admin-payments.component';

abstract class AdminPaymentTestData {
  public static payment(): AdminPayment {
    return { orderId: 'order-1', giftId: 'gift-1', giftName: 'Presente', amount: 100, contributorName: 'Convidado', method: 'credit_card', status: PaymentStatus.Approved, message: '', contributionCreated: true };
  }

  public static state(): AdminOperationsState {
    return { overview: null, contributions: [], contributionTotal: 0, contributionPages: 0, payments: [], paymentTotal: 0, paymentPages: 0, users: [], userTotal: 0, userPages: 0, loading: false, actionLoading: false, error: '' };
  }
}

describe('AdminPaymentsComponent', () => {
  let fixture: ComponentFixture<AdminPaymentsComponent>;
  let component: AdminPaymentsComponent;
  let operationsState: WritableSignal<AdminOperationsState>;
  let operations: { state: WritableSignal<AdminOperationsState>; loadPayments: jest.Mock; refundPayment: jest.Mock };

  beforeEach((): void => {
    operationsState = signal<AdminOperationsState>(AdminPaymentTestData.state());
    operations = { state: operationsState, loadPayments: jest.fn(), refundPayment: jest.fn() };
    TestBed.configureTestingModule({
      imports: [AdminPaymentsComponent],
      providers: [
        { provide: AdminOperationsService, useValue: operations },
        { provide: AuthService, useValue: { hasRole: jest.fn().mockReturnValue(true) } },
        { provide: ToastService, useValue: { success: jest.fn() } },
      ],
    });
    TestBed.overrideComponent(AdminPaymentsComponent, { set: { template: '<div></div>', imports: [] } });
    fixture = TestBed.createComponent(AdminPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('mapeia processed, cancelled e error corretamente', () => {
    expect(component.statusLabel(PaymentStatus.Processed)).toBe('Aprovado');
    expect(component.statusLabel(PaymentStatus.Cancelled)).toBe('Cancelado');
    expect(component.statusLabel(PaymentStatus.Error)).toBe('Erro');
    expect(component.statusLabel(PaymentStatus.ActionRequired)).toBe('Aguardando pagamento');
    expect(component.statusLabel(PaymentStatus.PartiallyRefunded)).toBe('Parcialmente estornado');
    expect(component.statusOptions).toEqual(expect.arrayContaining([PaymentStatus.Processed, PaymentStatus.ActionRequired, PaymentStatus.Cancelled, PaymentStatus.Error, PaymentStatus.PartiallyRefunded]));
  });

  it('não abre nem confirma outro estorno enquanto uma ação está em andamento', () => {
    const payment: AdminPayment = AdminPaymentTestData.payment();
    operationsState.set({ ...operationsState(), actionLoading: true });

    component.requestRefund(payment);
    expect(component.showRefundConfirm).toBe(false);

    component.paymentPendingRefund = payment;
    component.showRefundConfirm = true;
    component.confirmRefund();
    expect(operations.refundPayment).not.toHaveBeenCalled();
  });

  it('solicita estorno após confirmação quando não há outra ação', () => {
    const payment: AdminPayment = AdminPaymentTestData.payment();
    component.requestRefund(payment);
    const idempotencyKey: string = component.refundIdempotencyKey;
    component.confirmRefund();

    expect(idempotencyKey).not.toBe('');
    expect(operations.refundPayment).toHaveBeenCalledWith(payment, idempotencyKey, expect.any(Function));
    expect(component.showRefundConfirm).toBe(false);
  });

  it('reutiliza a chave de idempotência ao repetir o mesmo estorno após erro', () => {
    const payment: AdminPayment = AdminPaymentTestData.payment();
    component.requestRefund(payment);
    component.confirmRefund();
    const firstKey: string = component.refundIdempotencyKey;

    component.requestRefund(payment);
    component.confirmRefund();

    expect(operations.refundPayment.mock.calls[1][1]).toBe(firstKey);
  });
});
