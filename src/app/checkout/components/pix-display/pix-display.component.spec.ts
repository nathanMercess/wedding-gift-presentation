import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { EMPTY_PAYMENT_RESPONSE } from '../../constants/empty-payment-response.constant';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { PixStep } from '../../enums/pix-step.enum';
import { PaymentResult } from '../../models/payment-result.model';
import { PendingPayment } from '../../models/pending-payment.model';
import { PaymentState } from '../../models/payment-state.model';
import { PaymentStatusState } from '../../models/payment-status-state.model';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../../services/toast.service';
import { PixDisplayComponent } from './pix-display.component';

abstract class PixDisplayTestData {
  public static pendingPix(over: Partial<PendingPayment> = {}): PendingPayment {
    const now: string = new Date().toISOString();
    return {
      orderId: 'order-1',
      gift: { id: 'gift-1', image: '', name: 'Presente', price: 100, raised: 0, total: 100, fullyFunded: false, description: '', available: true, allowPartialContribution: true },
      amount: 100,
      contributorName: 'Convidado',
      message: '',
      method: PaymentMethod.Pix,
      status: PaymentStatus.Pending,
      createdAt: now,
      updatedAt: now,
      contributionCreated: false,
      ...over,
    };
  }
}

describe('PixDisplayComponent', () => {
  let fixture: ComponentFixture<PixDisplayComponent>;
  let component: PixDisplayComponent;
  let paymentState: WritableSignal<PaymentState>;
  let statusState: WritableSignal<PaymentStatusState>;
  let paymentService: { paymentState: WritableSignal<PaymentState>; statusState: WritableSignal<PaymentStatusState>; payWithPix: jest.Mock; loadOrder: jest.Mock };
  let toastService: { error: jest.Mock };

  beforeEach((): void => {
    paymentState = signal<PaymentState>({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '', uncertainFailure: false });
    statusState = signal<PaymentStatusState>({ orderId: '', hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '' });
    paymentService = { paymentState, statusState, payWithPix: jest.fn(), loadOrder: jest.fn() };
    toastService = { error: jest.fn() };

    TestBed.configureTestingModule({
      imports: [PixDisplayComponent],
      providers: [
        { provide: PaymentService, useValue: paymentService },
        { provide: ToastService, useValue: toastService },
      ],
    });
    TestBed.overrideComponent(PixDisplayComponent, { set: { template: '<div></div>', imports: [] } });
    fixture = TestBed.createComponent(PixDisplayComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('orderId', 'order-1');
    fixture.componentRef.setInput('giftId', 'gift-1');
    fixture.componentRef.setInput('giftName', 'Presente');
    fixture.componentRef.setInput('contributorName', 'Convidado');
    fixture.componentRef.setInput('amount', 100);
    fixture.detectChanges();
  });

  afterEach((): void => {
    fixture.destroy();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    jest.useRealTimers();
  });

  it('valida os dados antes de solicitar o PIX', () => {
    component.generatePix();
    expect(paymentService.payWithPix).not.toHaveBeenCalled();

    component.payerForm.setValue({ email: 'convidado@example.com', cpf: '123.456.789-09' });
    component.generatePix();

    expect(component.pixStep()).toBe(PixStep.Loading);
    expect(paymentService.payWithPix).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order-1', payerEmail: 'convidado@example.com', payerDocNumber: '12345678909' }));
  });

  it('só disponibiliza retomada depois de receber uma ordem PIX real', () => {
    const readyOrderIds: string[] = [];
    component.pixReady.subscribe((response): void => { readyOrderIds.push(response.orderId ?? ''); });
    component.payerForm.setValue({ email: 'convidado@example.com', cpf: '123.456.789-09' });
    component.generatePix();

    paymentState.set({ submitting: false, hasResponse: true, response: { status: PaymentStatus.ActionRequired, orderId: 'order-1', mpOrderId: 'mp-1', qrCode: 'pix-code' }, error: '', uncertainFailure: false });
    fixture.detectChanges();

    expect(component.pixStep()).toBe(PixStep.Qr);
    expect(component.qrCode()).toBe('pix-code');
    expect(component.remainingSeconds()).toBeGreaterThan(595);
    expect(readyOrderIds).toEqual(['order-1']);
  });

  it('usa expiresAt do backend no contador do PIX', () => {
    const expiresAt: string = new Date(Date.now() + 20 * 60 * 1000).toISOString();
    component.payerForm.setValue({ email: 'convidado@example.com', cpf: '123.456.789-09' });
    component.generatePix();

    paymentState.set({ submitting: false, hasResponse: true, response: { status: PaymentStatus.ActionRequired, orderId: 'order-1', mpOrderId: 'mp-1', qrCode: 'pix-code', expiresAt }, error: '', uncertainFailure: false });
    fixture.detectChanges();

    expect(component.remainingSeconds()).toBeGreaterThan(1190);
    expect(component.remainingSeconds()).toBeLessThanOrEqual(1200);
  });

  it('ignora retomada PIX pertencente a outro pedido ou presente', () => {
    fixture.componentRef.setInput('resumePayment', {
      orderId: 'other-order',
      gift: { id: 'other-gift', image: '', name: 'Outro presente', price: 100, raised: 0, total: 100, fullyFunded: false, description: '', available: true, allowPartialContribution: true },
      amount: 100,
      contributorName: 'Convidado',
      message: '',
      method: PaymentMethod.Pix,
      status: PaymentStatus.Pending,
      qrCode: 'other-pix-code',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contributionCreated: false,
    });
    component.ngOnInit();

    expect(component.pixStep()).toBe(PixStep.Form);
    expect(component.qrCode()).toBe('');
    expect(paymentService.loadOrder).not.toHaveBeenCalled();
  });

  it('consulta pelo orderId e aceita processed como aprovação', () => {
    const results: PaymentResult[] = [];
    component.paymentResolved.subscribe((result: PaymentResult): void => { results.push(result); });

    component.verifyNow();
    expect(paymentService.loadOrder).toHaveBeenCalledWith('order-1');

    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.Processed, orderId: 'order-1', contributionCreated: true }, error: '' });
    fixture.detectChanges();

    expect(results[0].status).toBe(PaymentStatus.Processed);
  });

  it('ignora status de outro pedido e aguarda a resposta correlacionada', () => {
    const results: PaymentResult[] = [];
    component.paymentResolved.subscribe((result: PaymentResult): void => { results.push(result); });

    component.verifyNow();
    statusState.set({ orderId: 'other-order', hasResponse: true, response: { status: PaymentStatus.Approved, orderId: 'other-order', contributionCreated: true }, error: '' });
    fixture.detectChanges();

    expect(results).toEqual([]);

    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.Approved, orderId: 'order-1', contributionCreated: true }, error: '' });
    fixture.detectChanges();

    expect(results).toHaveLength(1);
    expect(results[0].orderId).toBe('order-1');
  });

  it('permite informar os dados novamente quando a consulta do PIX falha', () => {
    let retries: number = 0;
    component.retryRequested.subscribe((): void => { retries += 1; });
    fixture.componentRef.setInput('resumePayment', PixDisplayTestData.pendingPix());
    component.ngOnInit();

    statusState.set({ orderId: 'order-1', hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: 'Pedido nao encontrado.' });
    fixture.detectChanges();

    expect(component.recoverableStatusError).toBe(true);
    expect(component.errorMessage()).toContain('Pedido');

    component.retryPixLookup();

    expect(component.pixStep()).toBe(PixStep.Form);
    expect(component.recoverableStatusError).toBe(false);
    expect(component.error()).toBe('');
    expect(retries).toBe(0);
  });

  it('oferece recuperacao quando o pedido pendente nao possui QR Code', () => {
    fixture.componentRef.setInput('resumePayment', PixDisplayTestData.pendingPix());
    component.ngOnInit();

    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.Pending, orderId: 'order-1' }, error: '' });
    fixture.detectChanges();

    expect(component.recoverableStatusError).toBe(true);
    expect(component.errorMessage()).toContain('PIX');
    expect(component.pixStep()).toBe(PixStep.Qr);
  });

  it('retoma PIX sem QR e hidrata os dados recebidos em status pendente', () => {
    const readyOrderIds: string[] = [];
    const expiresAt: string = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    component.pixReady.subscribe((response): void => { readyOrderIds.push(response.orderId ?? ''); });
    fixture.componentRef.setInput('resumePayment', {
      orderId: 'order-1',
      gift: { id: 'gift-1', image: '', name: 'Presente', price: 100, raised: 0, total: 100, fullyFunded: false, description: '', available: true, allowPartialContribution: true },
      amount: 100,
      contributorName: 'Convidado',
      message: '',
      method: PaymentMethod.Pix,
      status: PaymentStatus.Pending,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contributionCreated: false,
    });
    component.ngOnInit();

    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.ActionRequired, orderId: 'order-1', mpOrderId: 'mp-1', qrCode: 'pix-code', qrCodeBase64: 'pix-image', expiresAt }, error: '' });
    fixture.detectChanges();

    expect(paymentService.loadOrder).toHaveBeenCalledWith('order-1');
    expect(component.mpOrderId()).toBe('mp-1');
    expect(component.qrCode()).toBe('pix-code');
    expect(component.qrCodeBase64()).toBe('pix-image');
    expect(component.remainingSeconds()).toBeGreaterThan(295);
    expect(component.pixStep()).toBe(PixStep.Qr);
    expect(readyOrderIds).toEqual(['order-1']);
  });

  it('mostra erro recuperável para qualquer falha final', () => {
    component.verifyNow();
    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.Expired, orderId: 'order-1', errorCode: 'PIX_EXPIRED' }, error: '' });
    fixture.detectChanges();

    expect(component.terminalFailure()).toBe(true);
    expect(component.errorMessage()).toContain('Gere um novo código');
    expect(toastService.error).toHaveBeenCalled();
  });

  it('preserva o orderId em erro incerto e solicita outro em erro definitivo de geração', () => {
    let retries: number = 0;
    component.retryRequested.subscribe((): void => { retries += 1; });
    component.payerForm.setValue({ email: 'convidado@example.com', cpf: '123.456.789-09' });
    component.generatePix();

    paymentState.set({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: 'Gateway indisponível.', uncertainFailure: true });
    fixture.detectChanges();
    expect(retries).toBe(0);

    component.generatePix();
    paymentState.set({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: 'Dados inválidos.', uncertainFailure: false });
    fixture.detectChanges();
    expect(retries).toBe(1);
  });

  it('solicita um novo orderId ao tentar novamente', () => {
    let retries: number = 0;
    component.retryRequested.subscribe((): void => { retries += 1; });
    component.terminalFailure.set(true);
    component.error.set('PIX_EXPIRED');

    component.retryPix();

    expect(retries).toBe(1);
    expect(component.pixStep()).toBe(PixStep.Form);
    expect(component.terminalFailure()).toBe(false);
    expect(component.error()).toBe('');
  });

  it('polling usa o orderId e não o identificador do provedor', () => {
    jest.useFakeTimers();
    fixture.componentRef.setInput('resumePayment', {
      orderId: 'order-1',
      gift: { id: 'gift-1', image: '', name: 'Presente', price: 100, raised: 0, total: 100, fullyFunded: false, description: '', available: true, allowPartialContribution: true },
      amount: 100,
      contributorName: 'Convidado',
      message: '',
      method: PaymentMethod.Pix,
      status: PaymentStatus.Pending,
      mpOrderId: 'mp-sequencial',
      qrCode: 'pix-code',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      contributionCreated: false,
    });
    component.ngOnInit();

    jest.advanceTimersByTime(5000);

    expect(paymentService.loadOrder).toHaveBeenCalledWith('order-1');
  });

  it('aumenta o intervalo do polling de cinco para dez e quinze segundos', () => {
    jest.useFakeTimers();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    component.pixStep.set(PixStep.Qr);
    component.qrCode.set('pix-code');
    component.onVisibilityChange();
    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.Pending, orderId: 'order-1' }, error: '' });
    fixture.detectChanges();
    paymentService.loadOrder.mockClear();

    jest.advanceTimersByTime(4999);
    expect(paymentService.loadOrder).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(paymentService.loadOrder).toHaveBeenCalledTimes(1);

    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.InProcess, orderId: 'order-1' }, error: '' });
    fixture.detectChanges();
    jest.advanceTimersByTime(9999);
    expect(paymentService.loadOrder).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1);
    expect(paymentService.loadOrder).toHaveBeenCalledTimes(2);

    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.Pending, orderId: 'order-1' }, error: '' });
    fixture.detectChanges();
    jest.advanceTimersByTime(14999);
    expect(paymentService.loadOrder).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(1);
    expect(paymentService.loadOrder).toHaveBeenCalledTimes(3);
  });

  it('pausa o polling em aba oculta e consulta imediatamente ao voltar', () => {
    jest.useFakeTimers();
    component.pixStep.set(PixStep.Qr);
    component.qrCode.set('pix-code');
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    component.onVisibilityChange();
    statusState.set({ orderId: 'order-1', hasResponse: true, response: { status: PaymentStatus.Pending, orderId: 'order-1' }, error: '' });
    fixture.detectChanges();
    paymentService.loadOrder.mockClear();

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    component.onVisibilityChange();
    jest.advanceTimersByTime(30000);
    expect(paymentService.loadOrder).not.toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    component.onVisibilityChange();
    expect(paymentService.loadOrder).toHaveBeenCalledTimes(1);
  });
});
