import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestViewComponent } from './guest-view.component';
import { DEFAULT_SITE_SETTINGS } from '../../constants/default-site-settings.constant';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { PaymentResumeService } from '../../checkout/services/payment-resume.service';
import { GiftService } from '../../services/gift.service';
import { CoupleService } from '../../services/couple.service';
import { ToastService } from '../../services/toast.service';

const emptyCouple = {
  names: '', weddingDate: '', photoUrl: '', message: '', eventLocation: '', primaryColor: '', secondaryColor: '', giftDisplayMode: GiftDisplayMode.Traditional, carouselPhotos: [], siteSettings: { ...DEFAULT_SITE_SETTINGS, enabledCategories: [...DEFAULT_SITE_SETTINGS.enabledCategories] },
};

describe('GuestViewComponent — controle de skeleton (anti-flicker)', () => {
  let guestState: WritableSignal<any>;
  let coupleState: WritableSignal<any>;

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
