import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { EMPTY_PAYMENT_RESPONSE } from './constants/empty-payment-response.constant';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentState } from './models/payment-state.model';
import { PaymentService } from './services/payment.service';
import { CheckoutComponent } from './checkout.component';

describe('CheckoutComponent', () => {
  let fixture: ComponentFixture<CheckoutComponent>;
  let component: CheckoutComponent;
  let paymentState: WritableSignal<PaymentState>;

  beforeEach((): void => {
    paymentState = signal<PaymentState>({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '', uncertainFailure: false });
    TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({ orderId: 'order-1', amount: 100, giftId: 'gift-1', giftName: 'Presente', contributorName: 'Convidado' }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: PaymentService, useValue: { paymentState } },
      ],
    });
    TestBed.overrideComponent(CheckoutComponent, { set: { template: '<div></div>', imports: [] } });
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('bloqueia troca de método enquanto um pagamento está sendo enviado', () => {
    component.onMethodSelected(PaymentMethod.CreditCard);
    paymentState.set({ ...paymentState(), submitting: true });

    component.onMethodSelected(PaymentMethod.Pix);

    expect(component.activeMethod).toBe(PaymentMethod.CreditCard);
  });

  it('preserva o orderId em falha incerta e cria outro em rejeição final', () => {
    component.onMethodSelected(PaymentMethod.CreditCard);
    component.onPaymentFailed(false);
    expect(component.orderId).toBe('order-1');

    component.onPaymentFailed(true);

    expect(component.orderId).not.toBe('order-1');
    expect(component.cardConfig.orderId).toBe(component.orderId);
  });

  it('cria outro orderId ao gerar novamente um PIX', () => {
    component.onMethodSelected(PaymentMethod.Pix);
    component.onPixRetryRequested();

    expect(component.orderId).not.toBe('order-1');
  });
});
