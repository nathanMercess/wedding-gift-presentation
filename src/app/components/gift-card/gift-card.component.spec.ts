import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftCardComponent } from './gift-card.component';
import { Gift } from '../../models/gift.model';

function makeGift(over: Partial<Gift> = {}): Gift {
  return {
    id: 'g1', image: 'http://img/g1.jpg', name: 'Jogo de panelas', price: 100, raised: 50, total: 100,
    description: '', available: true, allowPartialContribution: true, ...over,
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

  it('clicar no botão Presentear emite presentClick (@Output via DOM)', () => {
    let clicked = false;
    component.presentClick.subscribe((): void => { clicked = true; });
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.card-hover-btn') as HTMLButtonElement;
    btn.click();
    expect(clicked).toBe(true);
  });
});
