import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftCardComponent } from './gift-card.component';
import { GiftDisplayMode } from '../../enums/gift-display-mode.enum';
import { Gift } from '../../models/gift.model';

function makeGift(over: Partial<Gift> = {}): Gift {
  return {
    id: 'g1', image: 'http://img/g1.jpg', name: 'Jogo de panelas', price: 100, raised: 50, total: 100,
    fullyFunded: false, description: '', available: true, allowPartialContribution: true, ...over,
  };
}

describe('GiftCardComponent', () => {
  let fixture: ComponentFixture<GiftCardComponent>;
  let component: GiftCardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GiftCardComponent] });
    fixture = TestBed.createComponent(GiftCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gift', makeGift());
    fixture.detectChanges();
  });

  it('cria e renderiza nome do presente', () => {
    expect(component).toBeTruthy();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Jogo de panelas');
  });

  it('progressPercent calcula a porcentagem arrecadada', () => {
    expect(component.progressPercent).toBe(50);
  });

  it('progressPercent nunca passa de 100%', () => {
    fixture.componentRef.setInput('gift', makeGift({ raised: 300, total: 100 }));
    expect(component.progressPercent).toBe(100);
  });

  it('onPresent emite presentClick', () => {
    let clicked = false;
    component.presentClick.subscribe((): void => { clicked = true; });
    component.onPresent();
    expect(clicked).toBe(true);
  });

  it('available true e fullyFunded true mantém o botão Presentear habilitado e mostra badge informativo', () => {
    fixture.componentRef.setInput('gift', makeGift({ available: true, fullyFunded: true, raised: 100, total: 100 }));
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('.card-hover-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
    expect(el.textContent).toContain('Meta atingida');
  });

  it('available false bloqueia o botão Presentear mesmo sem fullyFunded', () => {
    fixture.componentRef.setInput('gift', makeGift({ available: false, fullyFunded: false, raised: 0, total: 100 }));
    fixture.detectChanges();

    let clicked = false;
    component.presentClick.subscribe((): void => { clicked = true; });
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.card-hover-btn') as HTMLButtonElement;
    btn.click();

    expect(btn.disabled).toBe(true);
    expect(clicked).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Indisponível');
  });

  it('clicar no botão Presentear emite presentClick (@Output via DOM)', () => {
    let clicked = false;
    component.presentClick.subscribe((): void => { clicked = true; });
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.card-hover-btn') as HTMLButtonElement;
    btn.click();
    expect(clicked).toBe(true);
  });

  it('modo privado ilimitado mantem botao habilitado e esconde status publico', () => {
    fixture.componentRef.setInput('gift', makeGift({ available: false, fullyFunded: true, raised: 100, total: 100 }));
    fixture.componentRef.setInput('giftDisplayMode', GiftDisplayMode.PrivateUnlimited);
    fixture.detectChanges();

    let clicked = false;
    component.presentClick.subscribe((): void => { clicked = true; });
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.card-hover-btn') as HTMLButtonElement;
    btn.click();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(btn.disabled).toBe(false);
    expect(clicked).toBe(true);
    expect(text).not.toContain('Indispon');
    expect(text).not.toContain('Meta atingida');
  });
});
