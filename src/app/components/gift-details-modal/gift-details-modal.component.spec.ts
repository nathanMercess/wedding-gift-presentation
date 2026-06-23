import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftDetailsModalComponent } from './gift-details-modal.component';
import { ContributionSubmitData } from '../gift-contribution-form/gift-contribution-form.component';
import { ModalStep } from '../../enums/modal-step.enum';
import { Gift } from '../../models/gift.model';

function makeGift(over: Partial<Gift> = {}): Gift {
  return {
    id: 'g1', image: '', name: 'Aparelho de Jantar', price: 300, raised: 100, total: 300,
    description: '', available: true, allowPartialContribution: true, ...over,
  };
}

describe('GiftDetailsModalComponent', () => {
  let fixture: ComponentFixture<GiftDetailsModalComponent>;
  let component: GiftDetailsModalComponent;

  function setup(gift: Gift = makeGift()): void {
    TestBed.configureTestingModule({ imports: [GiftDetailsModalComponent] });
    TestBed.overrideComponent(GiftDetailsModalComponent, { set: { template: '<div></div>', imports: [] } });
    fixture = TestBed.createComponent(GiftDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gift', gift);
    fixture.componentRef.setInput('coupleName', 'David & Maira');
    fixture.detectChanges();
  }

  it('inicia no passo de contribuição', () => {
    setup();
    expect(component).toBeTruthy();
    expect(component.step).toBe(ModalStep.Contribution);
  });

  it('remaining = total - raised', () => {
    setup(makeGift({ total: 300, raised: 100 }));
    expect(component.remaining).toBe(200);
  });

  it('isCompleted é true quando o presente está indisponível', () => {
    setup(makeGift({ available: false }));
    expect(component.isCompleted).toBe(true);
  });

  it('availableQuickAmounts filtra valores que cabem no restante', () => {
    setup(makeGift({ total: 300, raised: 100 }));
    expect(component.availableQuickAmounts).toEqual([50, 100, 200]);
  });

  it('onContributionSubmit avança para Pagamento guardando os dados', () => {
    setup();
    const data: ContributionSubmitData = { guestName: 'Nathan', guestMessage: 'Parabéns!', amount: 150 };
    component.onContributionSubmit(data);

    expect(component.step).toBe(ModalStep.Payment);
    expect(component.contributorName).toBe('Nathan');
    expect(component.contributorMessage).toBe('Parabéns!');
    expect(component.contributionAmount).toBe(150);
    expect(component.orderId.length).toBeGreaterThan(0);
  });

  it('onPaymentApproved avança para Sucesso e emite paymentCompleted', () => {
    setup();
    let completed = false;
    component.paymentCompleted.subscribe((): void => { completed = true; });

    component.onPaymentApproved();

    expect(component.step).toBe(ModalStep.Success);
    expect(completed).toBe(true);
  });

  it('backToContribution retorna ao passo de contribuição', () => {
    setup();
    component.onContributionSubmit({ guestName: 'N', guestMessage: '', amount: 50 });
    component.backToContribution();
    expect(component.step).toBe(ModalStep.Contribution);
  });

  it('requestClose sem dados pendentes emite (close)', () => {
    setup();
    let closed = false;
    component.close.subscribe((): void => { closed = true; });
    component.requestClose();
    expect(closed).toBe(true);
    expect(component.showExitConfirm).toBe(false);
  });

  it('onContributionSubmit ignora chamadas duplicadas (anti duplo-clique)', () => {
    setup();
    component.onContributionSubmit({ guestName: 'Nathan', guestMessage: 'Oi', amount: 150 });
    const firstOrderId = component.orderId;

    component.onContributionSubmit({ guestName: 'Outro', guestMessage: 'Mudou', amount: 999 });

    expect(component.step).toBe(ModalStep.Payment);
    expect(component.contributorName).toBe('Nathan');
    expect(component.contributionAmount).toBe(150);
    expect(component.orderId).toBe(firstOrderId);
  });

  it('backdrop NÃO fecha o modal durante o Pagamento (evita ir pra home por toque acidental)', () => {
    setup();
    component.onContributionSubmit({ guestName: 'N', guestMessage: '', amount: 50 });
    let closed = false;
    component.close.subscribe((): void => { closed = true; });

    const event = { target: { classList: { contains: (c: string): boolean => c === 'modal-backdrop' } } } as unknown as MouseEvent;
    component.onBackdropClick(event);

    expect(component.step).toBe(ModalStep.Payment);
    expect(closed).toBe(false);
  });

  it('backdrop fecha normalmente no passo de contribuição', () => {
    setup();
    let closed = false;
    component.close.subscribe((): void => { closed = true; });

    const event = { target: { classList: { contains: (c: string): boolean => c === 'modal-backdrop' } } } as unknown as MouseEvent;
    component.onBackdropClick(event);

    expect(closed).toBe(true);
  });
});
