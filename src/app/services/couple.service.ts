import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { Couple } from '../models/couple.model';
import { CoupleState } from '../models/couple-state.model';
import { ThemeService } from './theme.service';
import { HttpErrorUtil } from '../utils/http-error';

interface ImageUploadResponse {
  url: string;
}

@Injectable({ providedIn: 'root' })
export class CoupleService {
  public readonly state: WritableSignal<CoupleState> = signal<CoupleState>({
    couple: { names: '', weddingDate: '', photo: '', message: '', primaryColor: '#C79A6D', secondaryColor: '#F7F0EA', carouselPhotos: [] },
    loading: false,
    saving: false,
    success: false,
    error: '',
    photoUploading: false,
    photoUploadError: '',
  });

  public constructor(
    public readonly http: HttpClient,
    public readonly endpointsUrls: EndpointsUrls,
    private readonly theme: ThemeService,
  ) {}

  public loadCouple(): void {
    this.patchState({ loading: true, error: '' });

    this.http.get<Couple>(this.endpointsUrls.coupleGet).pipe(finalize((): void => this.patchState({ loading: false }))).subscribe({
      next: (couple: Couple): void => {
        this.patchState({ couple });
        this.theme.apply(couple.primaryColor, couple.secondaryColor);
      },
      error: (err: HttpErrorResponse): void => {
        this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar informações do casal.') });
      },
    });
  }

  public saveCouple(couple: Partial<Couple>): void {
    this.patchState({ saving: true, success: false, error: '' });

    this.http.put<Couple>(this.endpointsUrls.coupleAdminUpdate, couple).pipe(finalize((): void => this.patchState({ saving: false }))).subscribe({
      next: (updatedCouple: Couple): void => {
        this.patchState({ couple: updatedCouple, success: true });
        this.theme.apply(updatedCouple.primaryColor, updatedCouple.secondaryColor);
      },
      error: (err: HttpErrorResponse): void => {
        this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao salvar informações do casal.') });
      },
    });
  }

  public uploadCouplePhoto(file: File, onSuccess: (url: string) => void, onError?: () => void): void {
    this.patchState({ photoUploading: true, photoUploadError: '' });

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<ImageUploadResponse>(this.endpointsUrls.adminUploadImage, formData)
      .pipe(finalize((): void => this.patchState({ photoUploading: false })))
      .subscribe({
        next: (response: ImageUploadResponse): void => {
          onSuccess(response.url);
        },
        error: (err: HttpErrorResponse): void => {
          const message = err.status === 413
            ? 'A imagem é muito grande para o servidor aceitar.'
            : HttpErrorUtil.extract(err, 'Erro ao enviar a foto.');
          this.patchState({ photoUploadError: message });
          if (onError) onError();
        },
      });
  }

  public clearCoupleFeedback(): void {
    this.patchState({ success: false, error: '' });
  }

  public patchState(partialState: Partial<CoupleState>): void {
    this.state.update((currentState: CoupleState): CoupleState => ({ ...currentState, ...partialState }));
  }
}
