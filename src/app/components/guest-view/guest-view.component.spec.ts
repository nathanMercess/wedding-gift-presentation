import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { GuestViewComponent } from './guest-view.component';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { GiftService } from '../../services/gift.service';
import { CoupleService } from '../../services/couple.service';

const emptyCouple = {
  names: '', weddingDate: '', photoUrl: '', message: '', eventLocation: '', primaryColor: '', secondaryColor: '', giftDisplayMode: GiftDisplayMode.Traditional, carouselPhotos: [],
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
