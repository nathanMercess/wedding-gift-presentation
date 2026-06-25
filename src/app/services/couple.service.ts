import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { Couple } from '../models/couple.model';
import { CoupleState } from '../models/couple-state.model';
import { ImageUploadResponse } from '../models/image-upload-response.model';
import { ApiResponseUtil } from '../utils/api-response.util';
import { CoupleUtil } from '../utils/couple.util';
import { HttpErrorUtil } from '../utils/http-error';
import { ThemeService } from './theme.service';

@Injectable({ providedIn: 'root' })
export class CoupleService {
  public readonly state: WritableSignal<CoupleState> = signal<CoupleState>({
    couple: { names: '', weddingDate: '', photoUrl: '', message: '', primaryColor: '#C79A6D', secondaryColor: '#F7F0EA', carouselPhotos: [] },
    loading: false,
    saving: false,
    success: false,
    error: '',
    photoUploading: false,
    photoUploadError: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls, public readonly theme: ThemeService) {}

  public loadCouple(): void {
    this.patchState({ loading: true, error: '' });

    this.http.get<ApiResponse<unknown>>(this.endpointsUrls.coupleGet)
      .pipe(
        ApiResponseUtil.data<unknown>('Erro ao carregar informacoes do casal.'),
        finalize((): void => this.patchState({ loading: false })),
      )
      .subscribe({
        next: (raw: unknown): void => {
          const couple: Couple = CoupleUtil.normalize(raw);
          this.patchState({ couple });
          this.theme.apply(couple.primaryColor, couple.secondaryColor);
        },
        error: (err: HttpErrorResponse): void => {
          this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar informacoes do casal.') });
        },
      });
  }

  public saveCouple(couple: Partial<Couple>): void {
    this.patchState({ saving: true, success: false, error: '' });

    const payload = { ...couple, photoUrl: couple.photoUrl };

    this.http.put<ApiResponse<unknown>>(this.endpointsUrls.coupleAdminUpdate, payload)
      .pipe(
        ApiResponseUtil.data<unknown>('Erro ao salvar informacoes do casal.'),
        finalize((): void => this.patchState({ saving: false })),
      )
      .subscribe({
        next: (raw: unknown): void => {
          const updatedCouple: Couple = CoupleUtil.normalize(raw);
          this.patchState({ couple: updatedCouple, success: true });
          this.theme.apply(updatedCouple.primaryColor, updatedCouple.secondaryColor);
        },
        error: (err: HttpErrorResponse): void => {
          this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao salvar informacoes do casal.') });
        },
      });
  }

  public uploadCouplePhoto(file: File, onSuccess: (url: string) => void, onError?: () => void): void {
    this.patchState({ photoUploading: true, photoUploadError: '' });

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<ApiResponse<ImageUploadResponse>>(this.endpointsUrls.adminUploadImage, formData)
      .pipe(
        ApiResponseUtil.data<ImageUploadResponse>('Erro ao enviar a foto.'),
        finalize((): void => this.patchState({ photoUploading: false })),
      )
      .subscribe({
        next: (response: ImageUploadResponse): void => {
          onSuccess(response.url);
        },
        error: (err: HttpErrorResponse): void => {
          this.patchState({ photoUploadError: HttpErrorUtil.extract(err, 'Erro ao enviar a foto.') });

          if (onError)
            onError();
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
