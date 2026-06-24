import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal, WritableSignal } from '@angular/core';
import { AdminGiftFormComponent } from './admin-gift-form.component';
import { GiftService } from '../../../services/gift.service';
import { Gift } from '../../../models/gift.model';

function makeGift(over: Partial<Gift> = {}): Gift {
  return {
    id: 'g1', image: '', name: 'Item', price: 100, raised: 0, total: 100,
    fullyFunded: false, description: '', available: true, allowPartialContribution: true, ...over,
  };
}

function validValue(over: Record<string, unknown> = {}): Record<string, unknown> {
  return { name: 'Air Fryer', total: 200, image: '', description: 'desc', allowPartialContribution: true, creditCardFeePercent: 10, creditCardMaxInstallments: 12, ...over };
}

describe('AdminGiftFormComponent', () => {
  let fixture: ComponentFixture<AdminGiftFormComponent>;
  let component: AdminGiftFormComponent;
  let adminState: WritableSignal<any>;
  let giftServiceMock: any;

  beforeEach(() => {
    adminState = signal<any>({ giftSaving: false, giftError: '', giftSaved: false, imageUploading: false, imageUploadError: '' });
    giftServiceMock = {
      adminState,
      saveAdminGift: jest.fn(),
      clearAdminGiftError: jest.fn(),
      resetAdminGiftSaved: jest.fn(),
      patchAdminState: jest.fn(),
      uploadGiftImage: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [AdminGiftFormComponent, HttpClientTestingModule],
      providers: [{ provide: GiftService, useValue: giftServiceMock }],
    });
    fixture = TestBed.createComponent(AdminGiftFormComponent);
    component = fixture.componentInstance;
  });

  it('inicia inválido — nome e total são obrigatórios', () => {
    fixture.detectChanges();
    expect(component.form.invalid).toBe(true);
    expect(component.form.get('name')!.hasError('required')).toBe(true);
    expect(component.form.get('total')!.hasError('required')).toBe(true);
  });

  it('total igual a zero é inválido (deve ser > 0)', () => {
    fixture.detectChanges();
    component.form.patchValue({ name: 'X', total: 0 });
    expect(component.form.get('total')!.hasError('min')).toBe(true);
  });

  it('save() inválido não chama o serviço e marca os campos', () => {
    fixture.detectChanges();
    component.save();
    expect(giftServiceMock.saveAdminGift).not.toHaveBeenCalled();
    expect(component.form.get('name')!.touched).toBe(true);
  });

  it('save() válido (criação) chama saveAdminGift com id null e raised 0', () => {
    fixture.detectChanges();
    component.form.setValue(validValue());
    component.save();
    expect(giftServiceMock.saveAdminGift).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ name: 'Air Fryer', total: 200, raised: 0, allowPartialContribution: true, creditCardFeePercent: 10, creditCardMaxInstallments: 12 }),
    );
  });

  it('editingGift popula o form e save() preserva id e raised existentes', () => {
    fixture.componentRef.setInput('editingGift', makeGift({ id: 'g9', name: 'Existente', total: 150, raised: 50 }));
    fixture.detectChanges();

    expect(component.form.get('name')!.value).toBe('Existente');
    expect(component.form.get('total')!.value).toBe(150);
    expect(component.form.get('creditCardFeePercent')!.value).toBe(0);
    expect(component.form.get('creditCardMaxInstallments')!.value).toBe(12);

    component.save();
    expect(giftServiceMock.saveAdminGift).toHaveBeenCalledWith('g9', expect.objectContaining({ raised: 50, total: 150 }));
  });

  it('anti-double-click: ignora save() enquanto giftSaving estiver ativo', () => {
    fixture.detectChanges();
    component.form.setValue(validValue());
    adminState.set({ ...adminState(), giftSaving: true });

    component.save();
    expect(giftServiceMock.saveAdminGift).not.toHaveBeenCalled();
  });

  it('rejeita imagem de tipo inválido sem fazer upload', () => {
    fixture.detectChanges();
    const file = new File(['x'], 'a.gif', { type: 'image/gif' });
    const event = { target: { files: [file], value: '' } } as unknown as Event;

    component.onImageSelected(event);

    expect(giftServiceMock.patchAdminState).toHaveBeenCalledWith(expect.objectContaining({ imageUploadError: expect.any(String) }));
    expect(giftServiceMock.uploadGiftImage).not.toHaveBeenCalled();
  });

  it('emite (cancel) ao cancelar', () => {
    fixture.detectChanges();
    let cancelled = false;
    component.cancel.subscribe((): void => { cancelled = true; });
    component.cancel.emit();
    expect(cancelled).toBe(true);
  });
});
