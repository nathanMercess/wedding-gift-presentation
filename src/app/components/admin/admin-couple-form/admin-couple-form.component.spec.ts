import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AdminCoupleFormComponent } from './admin-couple-form.component';
import { CoupleService } from '../../../services/couple.service';
import { ThemeService } from '../../../services/theme.service';
import { CarouselPhoto } from '../../../models/couple.model';

function photos(...urls: string[]): CarouselPhoto[] {
  return urls.map((url: string): CarouselPhoto => ({ url, tag: '', title: '' }));
}

describe('AdminCoupleFormComponent — carrossel', () => {
  let component: AdminCoupleFormComponent;

  beforeEach(() => {
    const coupleStub = {
      state: signal({
        couple: { names: '', weddingDate: '', photoUrl: '', message: '', primaryColor: '#000000', secondaryColor: '#d9d9d9', carouselPhotos: [] },
        loading: false, saving: false, success: false, error: '', photoUploading: false, photoUploadError: '',
      }),
      uploadCouplePhoto: jest.fn(),
      saveCouple: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [AdminCoupleFormComponent],
      providers: [
        { provide: CoupleService, useValue: coupleStub },
        { provide: ThemeService, useValue: { apply: jest.fn() } },
      ],
    });
    TestBed.overrideComponent(AdminCoupleFormComponent, { set: { template: '<div></div>', imports: [] } });

    const fixture = TestBed.createComponent(AdminCoupleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.couple = { ...component.couple, carouselPhotos: photos('a', 'b', 'c') };
  });

  it('move uma foto para frente', () => {
    component.moveCarouselPhoto(0, 1);
    expect(component.couple.carouselPhotos.map((p: CarouselPhoto): string => p.url)).toEqual(['b', 'a', 'c']);
  });

  it('move uma foto para trás', () => {
    component.moveCarouselPhoto(2, -1);
    expect(component.couple.carouselPhotos.map((p: CarouselPhoto): string => p.url)).toEqual(['a', 'c', 'b']);
  });

  it('ignora movimento além dos limites', () => {
    component.moveCarouselPhoto(0, -1);
    component.moveCarouselPhoto(2, 1);
    expect(component.couple.carouselPhotos.map((p: CarouselPhoto): string => p.url)).toEqual(['a', 'b', 'c']);
  });

  it('remove a foto pelo índice', () => {
    component.removeCarouselPhoto(1);
    expect(component.couple.carouselPhotos.map((p: CarouselPhoto): string => p.url)).toEqual(['a', 'c']);
  });

  it('drop de arquivos não-imagem é ignorado', () => {
    const txt = new File(['x'], 'a.txt', { type: 'text/plain' });
    const event = { preventDefault: (): void => {}, dataTransfer: { files: [txt] } } as unknown as DragEvent;

    component.onCarouselDrop(event);

    expect(component.couple.carouselPhotos.length).toBe(3);
    expect(component.isDraggingFiles).toBe(false);
  });
});
