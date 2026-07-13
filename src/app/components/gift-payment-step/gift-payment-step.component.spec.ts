import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { PaymentMethod } from '../../checkout/enums/payment-method.enum';
import { PaymentStatus } from '../../checkout/enums/payment-status.enum';
import { PendingPayment } from '../../checkout/models/pending-payment.model';
import { PaymentState } from '../../checkout/models/payment-state.model';
import { PaymentResumeService } from '../../checkout/services/payment-resume.service';
import { PaymentService } from '../../checkout/services/payment.service';
import { EMPTY_PAYMENT_RESPONSE } from '../../checkout/constants/empty-payment-response.constant';
import { Gift } from '../../models/gift.model';
import { GiftPaymentStepComponent } from './gift-payment-step.component';

describe('GiftPaymentStepComponent', () => {
  let fixture: ComponentFixture<GiftPaymentStepComponent>;
  let component: GiftPaymentStepComponent;
  let paymentState: WritableSignal<PaymentState>;
  let paymentResumeService: PaymentResumeService;

  beforeEach((): void => {
    localStorage.clear();
    paymentState = signal<PaymentState>({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '', uncertainFailure: false });
    paymentResumeService = new PaymentResumeService();

    TestBed.configureTestingModule({
      imports: [GiftPaymentStepComponent],
      providers: [
        { provide: PaymentService, useValue: { paymentState } },
        { provide: PaymentResumeService, useValue: paymentResumeService },
      ],
    });
    TestBed.overrideComponent(GiftPaymentStepComponent, { set: { template: '<div></div>', imports: [] } });
    fixture = TestBed.createComponent(GiftPaymentStepComponent);
    component = fixture.componentInstance;
    const gift: Gift = { id: 'gift-1', image: '', name: 'Presente', price: 100, raised: 0, total: 100, fullyFunded: false, description: '', available: true, allowPartialContribution: true };
    fixture.componentRef.setInput('gift', gift);
    fixture.componentRef.setInput('giftId', gift.id);
    fixture.componentRef.setInput('amount', 100);
    fixture.componentRef.setInput('orderId', 'order-1');
    fixture.componentRef.setInput('contributorName', 'Convidado');
    fixture.detectChanges();
  });

  it('não cria retomada apenas ao selecionar cartão', () => {
    component.onMethodSelected(PaymentMethod.CreditCard);

    expect(component.activeMethod).toBe(PaymentMethod.CreditCard);
    expect(paymentResumeService.state().pending).toBeNull();
  });

  it('só injeta retomada PIX quando orderId e giftId pertencem ao checkout atual', () => {
    const now: string = new Date().toISOString();
    const pendingPayment: PendingPayment = { orderId: 'other-order', gift: component.gift(), amount: 100, contributorName: 'Convidado', message: '', method: PaymentMethod.Pix, status: PaymentStatus.Pending, createdAt: now, updatedAt: now, contributionCreated: false };
    component.onMethodSelected(PaymentMethod.Pix);

    paymentResumeService.save(pendingPayment);
    expect(component.pixResumePayment).toBeNull();

    paymentResumeService.save({ ...pendingPayment, orderId: 'order-1', gift: { ...pendingPayment.gift, id: 'other-gift' } });
    expect(component.pixResumePayment).toBeNull();

    paymentResumeService.save({ ...pendingPayment, orderId: 'order-1' });
    expect(component.pixResumePayment?.orderId).toBe('order-1');
  });

  it('salva retomada do PIX assim que a geração começa', () => {
    component.onMethodSelected(PaymentMethod.Pix);
    paymentState.set({ ...paymentState(), submitting: true });
    fixture.detectChanges();

    expect(paymentResumeService.state().pending).toMatchObject({ orderId: 'order-1', method: PaymentMethod.Pix, status: PaymentStatus.Pending });
    expect(paymentResumeService.state().pending?.qrCode).toBeUndefined();
  });

  it('completa a retomada depois que o PIX real é criado', () => {
    component.onMethodSelected(PaymentMethod.Pix);
    component.onPixReady({ status: PaymentStatus.Pending, orderId: 'order-1', mpOrderId: 'mp-1', qrCode: 'pix-code' });

    expect(paymentResumeService.state().pending).toMatchObject({ orderId: 'order-1', method: PaymentMethod.Pix, mpOrderId: 'mp-1', qrCode: 'pix-code' });
  });

  it('mantém resultado pendente para consulta posterior e limpa um aprovado', () => {
    component.onPaymentResolved({ orderId: 'order-1', amount: 100, giftId: 'gift-1', giftName: 'Presente', contributorName: 'Convidado', message: '', method: PaymentMethod.CreditCard, status: PaymentStatus.InProcess, paidAt: new Date().toISOString(), contributionCreated: false });
    expect(paymentResumeService.state().pending?.status).toBe(PaymentStatus.InProcess);

    component.onPaymentResolved({ orderId: 'order-1', amount: 100, giftId: 'gift-1', giftName: 'Presente', contributorName: 'Convidado', message: '', method: PaymentMethod.CreditCard, status: PaymentStatus.Approved, paidAt: new Date().toISOString(), contributionCreated: true });
    expect(paymentResumeService.state().pending).toBeNull();
  });

  it('cria retomada ao iniciar o envio, preserva em falha incerta e troca o orderId em rejeição final', () => {
    const changedOrderIds: string[] = [];
    component.orderIdChanged.subscribe((orderId: string): void => { changedOrderIds.push(orderId); });
    component.onMethodSelected(PaymentMethod.CreditCard);
    paymentState.set({ ...paymentState(), submitting: true });
    fixture.detectChanges();

    expect(paymentResumeService.state().pending?.orderId).toBe('order-1');

    component.onPaymentFailed(false);
    expect(component.currentOrderId).toBe('order-1');
    expect(paymentResumeService.state().pending?.orderId).toBe('order-1');

    component.onPaymentFailed(true);
    expect(component.currentOrderId).not.toBe('order-1');
    expect(paymentResumeService.state().pending).toBeNull();
    expect(changedOrderIds).toEqual([component.currentOrderId]);
  });

  it('propaga o estado de processamento e ignora troca de método durante o envio', () => {
    const processingStates: boolean[] = [];
    component.processingChanged.subscribe((processing: boolean): void => { processingStates.push(processing); });

    paymentState.set({ ...paymentState(), submitting: true });
    fixture.detectChanges();
    component.onMethodSelected(PaymentMethod.Pix);

    expect(processingStates).toContain(true);
    expect(component.activeMethod).toBe(PaymentMethod.None);
  });
});
