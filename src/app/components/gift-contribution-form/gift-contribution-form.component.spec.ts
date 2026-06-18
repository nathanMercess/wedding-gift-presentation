import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftContributionFormComponent, ContributionSubmitData } from './gift-contribution-form.component';
import { ContributionType } from '../../enums/contribution-type.enum';
import { Gift } from '../../models/gift.model';

function makeGift(over: Partial<Gift> = {}): Gift {
  return {
    id: 'g1', image: '', name: 'Jogo de panelas', price: 300, raised: 0, total: 300,
    category: 'Cozinha', description: '', available: true, allowPartialContribution: true, ...over,
  };
}

describe('GiftContributionFormComponent', () => {
  let fixture: ComponentFixture<GiftContributionFormComponent>;
  let component: GiftContributionFormComponent;
  let emitted: ContributionSubmitData[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GiftContributionFormComponent] });
    fixture = TestBed.createComponent(GiftContributionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gift', makeGift());
    fixture.componentRef.setInput('minAmount', 10);
    fixture.componentRef.setInput('remaining', 300);
    fixture.componentRef.setInput('availableQuickAmounts', [50, 100]);

    emitted = [];
    component.submitted.subscribe((data: ContributionSubmitData): void => { emitted.push(data); });
  });

  it('deve ser criado com o form inválido (nome obrigatório)', () => {
    expect(component).toBeTruthy();
    expect(component.form.invalid).toBe(true);
    expect(component.nameControl.hasError('required')).toBe(true);
  });

  it('não emite e marca os campos quando submetido inválido', () => {
    component.onSubmit();
    expect(emitted.length).toBe(0);
    expect(component.nameControl.touched).toBe(true);
  });

  it('Valor restante: com nome preenchido emite o valor restante', () => {
    component.nameControl.setValue('Nathan Galvão');
    component.onSubmit();

    expect(emitted.length).toBe(1);
    expect(emitted[0].amount).toBe(300);
    expect(emitted[0].guestName).toBe('Nathan Galvão');
  });

  it('Valor parcial abaixo do mínimo é inválido e não emite', () => {
    component.nameControl.setValue('Nathan');
    component.selectType(ContributionType.Partial);
    component.amountControl.setValue('5');

    expect(component.amountControl.hasError('min')).toBe(true);
    component.onSubmit();
    expect(emitted.length).toBe(0);
  });

  it('Valor parcial acima do restante é inválido (max)', () => {
    component.selectType(ContributionType.Partial);
    component.amountControl.setValue('500');
    expect(component.amountControl.hasError('max')).toBe(true);
  });

  it('Valor parcial não-numérico é inválido', () => {
    component.selectType(ContributionType.Partial);
    component.amountControl.setValue('abc');
    expect(component.amountControl.invalid).toBe(true);
  });

  it('Valor parcial válido dentro da faixa emite o valor correto', () => {
    component.nameControl.setValue('Nathan');
    component.selectType(ContributionType.Partial);
    component.amountControl.setValue('100');

    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(emitted.length).toBe(1);
    expect(emitted[0].amount).toBe(100);
  });

  it('selectQuickAmount preenche e marca o controle de valor', () => {
    component.selectType(ContributionType.Partial);
    component.selectQuickAmount(50);
    expect(component.amountControl.value).toBe('50');
    expect(component.amountControl.touched).toBe(true);
  });

  it('isDirty reflete entrada do usuário', () => {
    expect(component.isDirty).toBe(false);
    component.nameControl.setValue('Nathan');
    expect(component.isDirty).toBe(true);
  });

  it('emite (cancelled) ao cancelar', () => {
    let cancelled = false;
    component.cancelled.subscribe((): void => { cancelled = true; });
    component.cancelled.emit();
    expect(cancelled).toBe(true);
  });
});
