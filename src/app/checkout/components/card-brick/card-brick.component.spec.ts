import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { EMPTY_PAYMENT_RESPONSE } from '../../constants/empty-payment-response.constant';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { PaymentState } from '../../models/payment-state.model';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../../services/toast.service';
import { CardBrickComponent } from './card-brick.component';

interface CardBrickTestAccess {
  hasPendingSubmission: boolean;
  handlePaymentState(state: PaymentState): void;
  onSubmit(formData: unknown): Promise<void>;
}

describe('CardBrickComponent', () => {
  let fixture: ComponentFixture<CardBrickComponent>;
  let component: CardBrickComponent;
  let paymentState: WritableSignal<PaymentState>;
  let testAccess: CardBrickTestAccess;

  beforeEach((): void => {
    paymentState = signal<PaymentState>({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '', uncertainFailure: false });
    TestBed.configureTestingModule({
      imports: [CardBrickComponent],
      providers: [
        { provide: PaymentService, useValue: { paymentState, payWithCard: jest.fn() } },
        { provide: ToastService, useValue: { error: jest.fn(), info: jest.fn() } },
      ],
    });
    TestBed.overrideComponent(CardBrickComponent, { set: { template: '<div></div>', imports: [] } });
    fixture = TestBed.createComponent(CardBrickComponent);
    component = fixture.componentInstance;
    testAccess = component as unknown as CardBrickTestAccess;
  });

  afterEach((): void => fixture.destroy());

  it('distingue falha de rede incerta de recusa final', () => {
    const finalFailures: boolean[] = [];
    component.paymentFailed.subscribe((finalFailure: boolean): void => { finalFailures.push(finalFailure); });

    testAccess.hasPendingSubmission = true;
    testAccess.handlePaymentState({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: 'Sem conexão.', uncertainFailure: true });

    testAccess.hasPendingSubmission = true;
    testAccess.handlePaymentState({ submitting: false, hasResponse: true, response: { status: PaymentStatus.Rejected, statusDetail: 'cc_rejected_other_reason' }, error: '', uncertainFailure: false });

    expect(finalFailures).toEqual([false, true]);
  });

  it('rejeita submissão duplicada enquanto a primeira ainda está pendente', async () => {
    testAccess.hasPendingSubmission = true;

    await expect(testAccess.onSubmit({})).rejects.toThrow('submission_in_progress');
  });
});
