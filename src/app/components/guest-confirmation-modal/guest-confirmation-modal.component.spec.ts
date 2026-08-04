import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WritableSignal, signal } from '@angular/core';
import { of } from 'rxjs';
import { GuestConfirmationStep } from '../../enums/guest-confirmation-step.enum';
import { GuestConfirmationState } from '../../models/guest-confirmation-state.model';
import { GuestConfirmationService } from '../../services/guest-confirmation.service';
import { GuestConfirmationModalComponent } from './guest-confirmation-modal.component';

describe('GuestConfirmationModalComponent', () => {
  let fixture: ComponentFixture<GuestConfirmationModalComponent>;
  let component: GuestConfirmationModalComponent;
  let state: WritableSignal<GuestConfirmationState>;

  beforeEach(async (): Promise<void> => {
    state = signal<GuestConfirmationState>({ submitting: false, error: '', confirmation: null });
    await TestBed.configureTestingModule({
      imports: [GuestConfirmationModalComponent],
      providers: [{
        provide: GuestConfirmationService,
        useValue: {
          state,
          reset: jest.fn(),
          patchState: (partialState: Partial<GuestConfirmationState>): void => state.update((currentState: GuestConfirmationState): GuestConfirmationState => ({ ...currentState, ...partialState })),
          getSuggestions: jest.fn(() => of([])),
          confirm: jest.fn(),
        },
      }],
    }).compileComponents();
    fixture = TestBed.createComponent(GuestConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('abre na escolha inicial sem expor informações operacionais', (): void => {
    const text: string = fixture.nativeElement.textContent;

    expect(component.step).toBe(GuestConfirmationStep.Choice);
    expect(text).toContain('Confirmar presença');
    expect(text).toContain('Já confirmei');
    expect(text).not.toContain('Texto livre');
    expect(text).not.toContain('Da lista');
    expect(text).not.toContain('Na lista');
  });

  it('abre o formulário ao escolher confirmar presença', (): void => {
    const button = fixture.debugElement.query(By.css('.guest-primary-action'));
    button.triggerEventHandler('click');
    fixture.detectChanges();

    expect(component.step).toBe(GuestConfirmationStep.Form);
    expect(fixture.debugElement.query(By.css('input[placeholder="Digite seu nome"]'))).toBeTruthy();
  });

  it('minimiza o painel quando a pessoa informa que já confirmou', (): void => {
    const closed: jest.Mock = jest.fn();
    component.closed.subscribe(closed);
    const button = fixture.debugElement.query(By.css('.guest-secondary-action'));
    button.triggerEventHandler('click');

    expect(closed).toHaveBeenCalledTimes(1);
  });
});
