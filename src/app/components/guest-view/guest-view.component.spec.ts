import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestViewComponent } from './guest-view.component';
import { DEFAULT_SITE_SETTINGS } from '../../constants/default-site-settings.constant';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { PaymentResumeService } from '../../checkout/services/payment-resume.service';
import { GiftService } from '../../services/gift.service';
import { CoupleService } from '../../services/couple.service';
import { CoupleDraftService } from '../../services/couple-draft.service';
import { ToastService } from '../../services/toast.service';

const emptyCouple = {
  names: '', weddingDate: '', photoUrl: '', message: '', eventLocation: '', primaryColor: '', secondaryColor: '', giftDisplayMode: GiftDisplayMode.Traditional, carouselPhotos: [], siteSettings: { ...DEFAULT_SITE_SETTINGS, enabledCategories: [...DEFAULT_SITE_SETTINGS.enabledCategories] },
};

describe('GuestViewComponent — controle de skeleton (anti-flicker)', () => {
  let guestState: WritableSignal<any>;
  let coupleState: WritableSignal<any>;

  beforeEach((): void => localStorage.clear());

  afterEach((): void => {
    jest.useRealTimers();
    document.body.classList.remove('modal-open');
  });

  function createComponent(): GuestViewComponent {
    guestState = signal<any>({ gifts: [], loading: false });
    coupleState = signal<any>({ loading: false, couple: emptyCouple });

    TestBed.configureTestingModule({
      imports: [GuestViewComponent],
      providers: [
        { provide: GiftService, useValue: { guestState, loadGuestGifts: jest.fn(), loadGuestStats: jest.fn() } },
        { provide: CoupleService, useValue: { state: coupleState, loadCouple: jest.fn() } },
        { provide: PaymentResumeService, useValue: { state: signal({ pending: null }), clear: jest.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: jest.fn((): null => null) } } } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: CoupleDraftService, useValue: { load: jest.fn((): null => null) } },
      ],
    });
    TestBed.overrideComponent(GuestViewComponent, { set: { template: '<div></div>', imports: [] } });
    return TestBed.createComponent(GuestViewComponent).componentInstance;
  }

  it('mostra o skeleton apenas no carregamento inicial (sem presentes ainda)', () => {
    const c = createComponent();
    guestState.set({ gifts: [], loading: true });
    expect(c.isInitialLoading).toBe(true);
  });

  it('destaca a confirmação com um tutorial após entrar no site', (): void => {
    jest.useFakeTimers();
    const component: GuestViewComponent = createComponent();
    component.ngOnInit();

    expect(component.showGuestConfirmationTutorial).toBe(false);
    jest.advanceTimersByTime(800);

    expect(component.showGuestConfirmationTutorial).toBe(true);
    expect(component.showGuestConfirmation).toBe(false);
    expect(document.body.classList.contains('modal-open')).toBe(true);
  });

  it('não repete o tutorial após recarregar a página', (): void => {
    jest.useFakeTimers();
    localStorage.setItem('guest-confirmation-tutorial-seen-v1', 'true');

    const component: GuestViewComponent = createComponent();
    component.ngOnInit();
    jest.advanceTimersByTime(800);

    expect(component.showGuestConfirmation).toBe(false);
    expect(component.showGuestConfirmationTutorial).toBe(false);
  });

  it('bloqueia o scroll ao abrir e atualiza o cache ao minimizar', (): void => {
    const component: GuestViewComponent = createComponent();

    component.openGuestConfirmation();
    expect(document.body.classList.contains('modal-open')).toBe(true);
    expect(localStorage.getItem('guest-confirmation-tutorial-seen-v1')).toBe('true');

    component.closeGuestConfirmation();
    expect(localStorage.getItem('guest-confirmation-dismissed')).toBe('true');
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('dispensa o tutorial e mantém o acesso pela ação flutuante', (): void => {
    const component: GuestViewComponent = createComponent();
    component.showGuestConfirmationTutorial = true;
    document.body.classList.add('modal-open');

    component.dismissGuestConfirmationTutorial();

    expect(component.showGuestConfirmationTutorial).toBe(false);
    expect(component.showGuestConfirmation).toBe(false);
    expect(localStorage.getItem('guest-confirmation-tutorial-seen-v1')).toBe('true');
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('NÃO mostra o skeleton em refresh — já há presentes carregados', () => {
    const c = createComponent();
    guestState.set({ gifts: [{ id: 'g1' }], loading: true });
    expect(c.isInitialLoading).toBe(false);
  });

  it('mostra o skeleton enquanto o casal ainda carrega', () => {
    const c = createComponent();
    guestState.set({ gifts: [{ id: 'g1' }], loading: false });
    coupleState.set({ loading: true, couple: emptyCouple });
    expect(c.isInitialLoading).toBe(true);
  });

  it('conteúdo visível (sem skeleton) quando tudo está carregado', () => {
    const c = createComponent();
    guestState.set({ gifts: [{ id: 'g1' }], loading: false });
    coupleState.set({ loading: false, couple: emptyCouple });
    expect(c.isInitialLoading).toBe(false);
  });
  it('esconde estatisticas publicas quando a lista e privada ilimitada', () => {
    const c = createComponent();
    coupleState.set({ loading: false, couple: { ...emptyCouple, giftDisplayMode: GiftDisplayMode.PrivateUnlimited } });
    expect(c.showGuestStats).toBe(false);
  });
});
