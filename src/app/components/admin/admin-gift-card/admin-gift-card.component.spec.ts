import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminGiftCardComponent } from './admin-gift-card.component';
import { Gift } from '../../../models/gift.model';

function makeGift(over: Partial<Gift> = {}): Gift {
  return {
    id: 'g1', image: '', name: 'Aparelho de Jantar', price: 500, raised: 250, total: 500,
    description: '', available: true, allowPartialContribution: true, ...over,
  };
}

describe('AdminGiftCardComponent', () => {
  let fixture: ComponentFixture<AdminGiftCardComponent>;
  let component: AdminGiftCardComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AdminGiftCardComponent] });
    fixture = TestBed.createComponent(AdminGiftCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gift', makeGift());
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('cria e renderiza nome e status do presente', () => {
    expect(component).toBeTruthy();
    expect(el.textContent).toContain('Aparelho de Jantar');
    expect(el.textContent).toContain('Disponível');
  });

  it('getProgressPercent calcula a porcentagem (limitada a 100)', () => {
    expect(component.getProgressPercent()).toBe(50);
    fixture.componentRef.setInput('gift', makeGift({ raised: 999, total: 500 }));
    expect(component.getProgressPercent()).toBe(100);
  });

  it('getProgressPercent é 0 quando total <= 0', () => {
    fixture.componentRef.setInput('gift', makeGift({ total: 0 }));
    expect(component.getProgressPercent()).toBe(0);
  });

  it('emite edit com o presente ao clicar em Editar', () => {
    let emitted: Gift | undefined;
    component.edit.subscribe((g: Gift): void => { emitted = g; });
    (el.querySelector('[title="Editar"]') as HTMLButtonElement).click();
    expect(emitted?.id).toBe('g1');
  });

  it('emite delete com o presente ao clicar em Remover', () => {
    let emitted: Gift | undefined;
    component.delete.subscribe((g: Gift): void => { emitted = g; });
    (el.querySelector('[title="Remover"]') as HTMLButtonElement).click();
    expect(emitted?.id).toBe('g1');
  });

  it('mostra "Concluído" quando indisponível', () => {
    fixture.componentRef.setInput('gift', makeGift({ available: false }));
    fixture.detectChanges();
    expect(el.textContent).toContain('Concluído');
  });
});
