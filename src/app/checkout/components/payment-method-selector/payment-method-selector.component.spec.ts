import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentMethodSelectorComponent } from './payment-method-selector.component';

describe('PaymentMethodSelectorComponent', () => {
  let fixture: ComponentFixture<PaymentMethodSelectorComponent>;
  let component: PaymentMethodSelectorComponent;

  beforeEach((): void => {
    TestBed.configureTestingModule({ imports: [PaymentMethodSelectorComponent] });
    fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
    component = fixture.componentInstance;
  });

  it('não altera nem emite o método quando está desabilitado', () => {
    const selectedMethods: PaymentMethod[] = [];
    component.methodSelected.subscribe((method: PaymentMethod): void => { selectedMethods.push(method); });
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    component.select(PaymentMethod.Pix);

    expect(component.activeMethod).toBe(PaymentMethod.None);
    expect(selectedMethods).toEqual([]);
  });
});
