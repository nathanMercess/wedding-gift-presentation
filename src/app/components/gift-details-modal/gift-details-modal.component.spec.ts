import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { EMPTY_PAYMENT_RESPONSE } from '../../checkout/constants/empty-payment-response.constant';
import { PaymentMethod } from '../../checkout/enums/payment-method.enum';
import { PaymentStatus } from '../../checkout/enums/payment-status.enum';
import { PendingPayment } from '../../checkout/models/pending-payment.model';
import { PaymentState } from '../../checkout/models/payment-state.model';
import { PaymentStatusState } from '../../checkout/models/payment-status-state.model';
import { PaymentResumeService } from '../../checkout/services/payment-resume.service';
import { PaymentService } from '../../checkout/services/payment.service';
import { GiftDetailsModalComponent } from './gift-details-modal.component';
import { ContributionSubmitData } from '../gift-contribution-form/gift-contribution-form.component';
import { ModalStep } from '../../enums/modal-step.enum';
import { ContributionType } from '../../enums/contribution-type.enum';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { Gift } from '../../models/gift.model';
import { GiftService } from '../../services/gift.service';

let fixture: ComponentFixture<GiftDetailsModalComponent>;
let component: GiftDetailsModalComponent;
let paymentState: WritableSignal<PaymentState>;
let statusState: WritableSignal<PaymentStatusState>;
let paymentServiceMock: { paymentState: WritableSignal<PaymentState>; statusState: WritableSignal<PaymentStatusState>; loadOrder: jest.Mock };
let paymentResumeServiceMock: { state: jest.Mock; clear: jest.Mock; update: jest.Mock };

abstract class GiftDetailsModalTestData {
  public static gift(over: Partial<Gift> = {}): Gift {
    return {
      id: 'g1', image: '', name: 'Aparelho de Jantar', price: 300, raised: 100, total: 300,
      fullyFunded: false, description: '', available: true, allowPartialContribution: true, ...over,
    };
  }

  public static pendingCard(orderId: string = 'order-card'): PendingPayment {
    const now: string = new Date().toISOString();
    return { orderId, gift: GiftDetailsModalTestData.gift(), amount: 100, contributorName: 'Nathan', message: '', method: PaymentMethod.CreditCard, status: PaymentStatus.Pending, createdAt: now, updatedAt: now, contributionCreated: false };
  }

  public static setup(gift: Gift = GiftDetailsModalTestData.gift(), giftDisplayMode: GiftDisplayMode = GiftDisplayMode.Traditional, resumePayment: PendingPayment | null = null): void {
    const giftServiceMock: Pick<GiftService, 'loadGuestGiftById'> = {
      loadGuestGiftById: (_giftId: string, onSuccess: (gift: Gift) => void): void => onSuccess(gift),
    };
    paymentState = signal<PaymentState>({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '', uncertainFailure: false });
    statusState = signal<PaymentStatusState>({ orderId: '', hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '' });
    paymentServiceMock = { paymentState, statusState, loadOrder: jest.fn() };
    paymentResumeServiceMock = { state: jest.fn().mockReturnValue({ pending: resumePayment }), clear: jest.fn(), update: jest.fn() };

    TestBed.configureTestingModule({
      imports: [GiftDetailsModalComponent],
      providers: [
        { provide: GiftService, useValue: giftServiceMock },
        { provide: PaymentService, useValue: paymentServiceMock },
        { provide: PaymentResumeService, useValue: paymentResumeServiceMock },
      ],
    });
    TestBed.overrideComponent(GiftDetailsModalComponent, { set: { template: '<div></div>', imports: [] } });
    fixture = TestBed.createComponent(GiftDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gift', gift);
    fixture.componentRef.setInput('coupleName', 'David & Maira');
    fixture.componentRef.setInput('giftDisplayMode', giftDisplayMode);
    fixture.componentRef.setInput('resumePayment', resumePayment);
    fixture.detectChanges();
  }
}

describe('GiftDetailsModalComponent', () => {
  it('inicia no passo de contribuição', () => {
    GiftDetailsModalTestData.setup();
    expect(component).toBeTruthy();
    expect(component.step).toBe(ModalStep.Contribution);
  });

  it('remaining = total - raised', () => {
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift({ total: 300, raised: 100 }));
    expect(component.remaining).toBe(200);
  });

  it('isUnavailable é true quando o presente está indisponível', () => {
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift({ available: false }));
    expect(component.isUnavailable).toBe(true);
  });

  it('mantém contribuição liberada quando available true e fullyFunded true', () => {
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift({ available: true, fullyFunded: true, raised: 300, total: 300 }));
    expect(component.isUnavailable).toBe(false);
    expect(component.isFullyFunded).toBe(true);
    expect(component.remaining).toBe(0);
    expect(component.contributionLimit).toBe(300);
    expect(component.minAmount).toBe(10);
  });

  it('availableQuickAmounts filtra valores que cabem no restante', () => {
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift({ total: 300, raised: 100 }));
    expect(component.availableQuickAmounts).toEqual([50, 100, 200]);
  });

  it('contributionLimit usa o total quando o presente nao permite valor parcial', () => {
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift({ allowPartialContribution: false, total: 50, raised: 1 }));
    expect(component.remaining).toBe(49);
    expect(component.contributionLimit).toBe(50);
  });

  it('availableQuickAmounts usa o total como limite quando a meta já foi atingida', () => {
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift({ fullyFunded: true, total: 300, raised: 300 }));
    expect(component.availableQuickAmounts).toEqual([50, 100, 200, 300]);
  });

  it('onContributionSubmit avança para Pagamento guardando os dados', () => {
    GiftDetailsModalTestData.setup();
    const data: ContributionSubmitData = { guestName: 'Nathan', guestMessage: 'Parabéns!', amount: 150, contributionType: ContributionType.Partial, customAmount: '150' };
    component.onContributionSubmit(data);

    expect(component.step).toBe(ModalStep.Payment);
    expect(component.contributorName).toBe('Nathan');
    expect(component.contributorMessage).toBe('Parabéns!');
    expect(component.contributionAmount).toBe(150);
    expect(component.contributionType).toBe(ContributionType.Partial);
    expect(component.customAmount).toBe('150');
    expect(component.orderId.length).toBeGreaterThan(0);
  });

  it('onPaymentApproved avança para Sucesso e emite paymentCompleted', () => {
    GiftDetailsModalTestData.setup();
    let completed = false;
    component.paymentCompleted.subscribe((): void => { completed = true; });

    component.onPaymentApproved();

    expect(component.step).toBe(ModalStep.Success);
    expect(completed).toBe(true);
  });

  it('backToContribution retorna ao passo de contribuição', () => {
    GiftDetailsModalTestData.setup();
    component.onContributionSubmit({ guestName: 'N', guestMessage: '', amount: 50, contributionType: ContributionType.Full, customAmount: '' });
    component.backToContribution();
    expect(component.step).toBe(ModalStep.Contribution);
  });

  it('requestClose sem dados pendentes emite (close)', () => {
    GiftDetailsModalTestData.setup();
    let closed = false;
    component.close.subscribe((): void => { closed = true; });
    component.requestClose();
    expect(closed).toBe(true);
    expect(component.showExitConfirm).toBe(false);
  });

  it('onContributionSubmit ignora chamadas duplicadas (anti duplo-clique)', () => {
    GiftDetailsModalTestData.setup();
    component.onContributionSubmit({ guestName: 'Nathan', guestMessage: 'Oi', amount: 150, contributionType: ContributionType.Partial, customAmount: '150' });
    const firstOrderId = component.orderId;

    component.onContributionSubmit({ guestName: 'Outro', guestMessage: 'Mudou', amount: 999, contributionType: ContributionType.Partial, customAmount: '999' });

    expect(component.step).toBe(ModalStep.Payment);
    expect(component.contributorName).toBe('Nathan');
    expect(component.contributionAmount).toBe(150);
    expect(component.orderId).toBe(firstOrderId);
  });

  it('backdrop NÃO fecha o modal durante o Pagamento (evita ir pra home por toque acidental)', () => {
    GiftDetailsModalTestData.setup();
    component.onContributionSubmit({ guestName: 'N', guestMessage: '', amount: 50, contributionType: ContributionType.Full, customAmount: '' });
    let closed = false;
    component.close.subscribe((): void => { closed = true; });

    const event = { target: { classList: { contains: (c: string): boolean => c === 'modal-backdrop' } } } as unknown as MouseEvent;
    component.onBackdropClick(event);

    expect(component.step).toBe(ModalStep.Payment);
    expect(closed).toBe(false);
  });

  it('backdrop fecha normalmente no passo de contribuição', () => {
    GiftDetailsModalTestData.setup();
    let closed = false;
    component.close.subscribe((): void => { closed = true; });

    const event = { target: { classList: { contains: (c: string): boolean => c === 'modal-backdrop' } } } as unknown as MouseEvent;
    component.onBackdropClick(event);

    expect(closed).toBe(true);
  });

  it('bloqueia voltar e fechar durante uma submissão de pagamento', () => {
    GiftDetailsModalTestData.setup();
    component.onContributionSubmit({ guestName: 'N', guestMessage: '', amount: 50, contributionType: ContributionType.Full, customAmount: '' });
    let closed: boolean = false;
    component.close.subscribe((): void => { closed = true; });
    paymentState.set({ ...paymentState(), submitting: true });

    component.backToContribution();
    component.requestClose();

    expect(component.step).toBe(ModalStep.Payment);
    expect(closed).toBe(false);
  });

  it('consulta o backend antes de mostrar uma retomada de cartão pendente', () => {
    const pendingPayment: PendingPayment = GiftDetailsModalTestData.pendingCard();
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift(), GiftDisplayMode.Traditional, pendingPayment);
    let closed: boolean = false;
    component.close.subscribe((): void => { closed = true; });

    expect(paymentServiceMock.loadOrder).toHaveBeenCalledWith('order-card');
    expect(component.step).toBe(ModalStep.Payment);
    expect(component.resolvingResumePayment).toBe(true);
    expect(component.paymentResult).toBeNull();

    component.backToContribution();
    component.requestClose();
    statusState.set({ orderId: 'other-order', hasResponse: true, response: { status: PaymentStatus.Approved, orderId: 'other-order', contributionCreated: true }, error: '' });
    fixture.detectChanges();

    expect(component.step).toBe(ModalStep.Payment);
    expect(closed).toBe(false);
    expect(component.resolvingResumePayment).toBe(true);
    expect(component.paymentResult).toBeNull();

    statusState.set({ orderId: 'order-card', hasResponse: true, response: { status: PaymentStatus.InProcess, orderId: 'order-card', contributionCreated: false }, error: '' });
    fixture.detectChanges();

    expect(component.step).toBe(ModalStep.Success);
    expect(component.modalTitle).toBe('Pagamento em análise');
    expect(component.paymentResult?.status).toBe(PaymentStatus.InProcess);
    expect(paymentResumeServiceMock.update).toHaveBeenCalled();
  });

  it('ignora uma resposta de retomada recebida depois de destruir o modal', () => {
    const pendingPayment: PendingPayment = GiftDetailsModalTestData.pendingCard();
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift(), GiftDisplayMode.Traditional, pendingPayment);

    fixture.destroy();
    statusState.set({ orderId: 'order-card', hasResponse: true, response: { status: PaymentStatus.Approved, orderId: 'order-card', contributionCreated: true }, error: '' });

    expect(component.paymentResult).toBeNull();
    expect(paymentResumeServiceMock.update).not.toHaveBeenCalled();
    expect(paymentResumeServiceMock.clear).not.toHaveBeenCalled();
  });

  it('modo privado ilimitado libera presente indisponivel e usa total como limite', () => {
    GiftDetailsModalTestData.setup(GiftDetailsModalTestData.gift({ available: false, fullyFunded: true, raised: 300, total: 300 }), GiftDisplayMode.PrivateUnlimited);
    expect(component.isUnavailable).toBe(false);
    expect(component.isFullyFunded).toBe(false);
    expect(component.contributionLimit).toBe(300);
    expect(component.availableQuickAmounts).toEqual([50, 100, 200, 300]);
  });
});
