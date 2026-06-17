import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { ContributionRequest } from '../models/contribution-request.model';
import { AdminGiftState } from '../models/admin-gift-state.model';
import { GuestGiftState } from '../models/guest-gift-state.model';
import { GiftContributionState } from '../models/gift-contribution-state.model';
import { Gift } from '../models/gift.model';
import { PagedResult } from '../models/paged-result.model';
import { ImageUploadResponse } from '../models/image-upload-response.model';
import { HttpErrorUtil } from '../utils/http-error';

export interface GiftQueryParams {
  search?: string;
  category?: string;
  orderBy?: string;
  orderDir?: string;
  onlyAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class GiftService {
  public readonly adminState: WritableSignal<AdminGiftState> = signal<AdminGiftState>({
    gifts: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    giftsLoading: false,
    giftsError: '',
    giftSaving: false,
    giftError: '',
    giftSaved: false,
    imageUploading: false,
    imageUploadError: '',
  });

  public readonly guestState: WritableSignal<GuestGiftState> = signal<GuestGiftState>({
    gifts: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: '',
    overallTotal: 0,
    overallCompleted: 0,
    overallRaised: 0,
    overallGoal: 0,
  });

  public readonly contributionState: WritableSignal<GiftContributionState> = signal<GiftContributionState>({
    submitting: false,
    success: false,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls) {}

  public loadGuestGifts(params: GiftQueryParams = {}): void {
    this.patchGuestState({ loading: true, error: '' });

    let httpParams = new HttpParams();
    if (params.category && params.category !== 'todos') httpParams = httpParams.set('category', params.category);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.orderDir) httpParams = httpParams.set('orderDir', params.orderDir);
    if (params.onlyAvailable !== undefined) httpParams = httpParams.set('onlyAvailable', String(params.onlyAvailable));
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.pageSize) httpParams = httpParams.set('pageSize', String(params.pageSize));

    this.http.get<PagedResult<Gift>>(this.endpointsUrls.giftsList, { params: httpParams })
      .pipe(finalize((): void => this.patchGuestState({ loading: false })))
      .subscribe({
        next: (result: PagedResult<Gift>): void => {
          this.patchGuestState({
            gifts: result.items,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.page,
          });
        },
        error: (err: HttpErrorResponse): void => {
          this.patchGuestState({ error: HttpErrorUtil.extract(err, 'Não foi possível carregar os presentes.') });
        },
      });
  }

  public loadAdminGifts(params: GiftQueryParams = {}): void {
    this.patchAdminState({ giftsLoading: true, giftsError: '' });

    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category && params.category !== 'todos') httpParams = httpParams.set('category', params.category);
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.orderDir) httpParams = httpParams.set('orderDir', params.orderDir);
    if (params.onlyAvailable !== undefined) httpParams = httpParams.set('onlyAvailable', String(params.onlyAvailable));
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.pageSize) httpParams = httpParams.set('pageSize', String(params.pageSize));

    this.http.get<PagedResult<Gift>>(this.endpointsUrls.adminGiftsList, { params: httpParams })
      .pipe(finalize((): void => this.patchAdminState({ giftsLoading: false })))
      .subscribe({
        next: (result: PagedResult<Gift>): void => {
          this.patchAdminState({
            gifts: result.items,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.page,
          });
        },
        error: (err: HttpErrorResponse): void => {
          this.patchAdminState({ giftsError: HttpErrorUtil.extract(err, 'Erro ao carregar presentes.') });
        },
      });
  }

  public saveAdminGift(giftId: string | null, gift: Partial<Gift>): void {
    this.patchAdminState({ giftSaving: true, giftError: '', giftSaved: false });

    if (giftId === null) {
      this.http.post<Gift>(this.endpointsUrls.adminGiftsList, gift)
        .pipe(finalize((): void => this.patchAdminState({ giftSaving: false })))
        .subscribe({
          next: (): void => {
            this.patchAdminState({ giftSaved: true });
            this.loadAdminGifts();
          },
          error: (err: HttpErrorResponse): void => {
            this.patchAdminState({ giftError: HttpErrorUtil.extract(err, 'Erro ao salvar presente.') });
          },
        });
      return;
    }

    this.http.put<Gift>(this.endpointsUrls.adminGiftsById(giftId), gift)
      .pipe(finalize((): void => this.patchAdminState({ giftSaving: false })))
      .subscribe({
        next: (): void => {
          this.patchAdminState({ giftSaved: true });
          this.loadAdminGifts();
        },
        error: (err: HttpErrorResponse): void => {
          this.patchAdminState({ giftError: HttpErrorUtil.extract(err, 'Erro ao salvar presente.') });
        },
      });
  }

  public deleteAdminGift(id: string): void {
    this.patchAdminState({ giftsError: '' });

    this.http.delete<void>(this.endpointsUrls.adminGiftsById(id)).subscribe({
      next: (): void => { this.loadAdminGifts(); },
      error: (err: HttpErrorResponse): void => {
        this.patchAdminState({ giftsError: HttpErrorUtil.extract(err, 'Erro ao remover presente.') });
      },
    });
  }

  public clearAdminGiftError(): void {
    this.patchAdminState({ giftError: '' });
  }

  public uploadGiftImage(file: File, onSuccess: (url: string) => void, onError?: () => void): void {
    this.patchAdminState({ imageUploading: true, imageUploadError: '' });

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<ImageUploadResponse>(this.endpointsUrls.adminUploadImage, formData)
      .pipe(finalize((): void => this.patchAdminState({ imageUploading: false })))
      .subscribe({
        next: (response: ImageUploadResponse): void => { onSuccess(response.url); },
        error: (err: HttpErrorResponse): void => {
          const message = err.status === 413
            ? 'A imagem é muito grande para o servidor aceitar.'
            : HttpErrorUtil.extract(err, 'Erro ao enviar a imagem.');
          this.patchAdminState({ imageUploadError: message });
          if (onError) onError();
        },
      });
  }

  public resetAdminGiftSaved(): void {
    this.patchAdminState({ giftSaved: false });
  }

  public contributeToGift(giftId: string, payload: ContributionRequest, onSuccess?: () => void): void {
    this.patchContributionState({ submitting: true, success: false, error: '' });

    this.http.post<void>(this.endpointsUrls.giftsContribute(giftId), payload)
      .pipe(finalize((): void => this.patchContributionState({ submitting: false })))
      .subscribe({
        next: (): void => {
          this.patchContributionState({ success: true });
          this.loadGuestGifts();
          if (onSuccess) onSuccess();
        },
        error: (err: HttpErrorResponse): void => {
          this.patchContributionState({ error: HttpErrorUtil.extract(err, 'Erro ao registrar contribuição. Tente novamente.') });
        },
      });
  }

  public loadGuestStats(): void {
    this.http.get<PagedResult<Gift>>(this.endpointsUrls.giftsList, {
      params: new HttpParams().set('pageSize', '9999'),
    }).subscribe({
      next: (result: PagedResult<Gift>): void => {
        this.patchGuestState({
          overallTotal: result.totalCount,
          overallCompleted: result.items.filter((g: Gift): boolean => !g.available).length,
          overallRaised: result.items.reduce((s: number, g: Gift): number => s + g.raised, 0),
          overallGoal: result.items.reduce((s: number, g: Gift): number => s + g.total, 0),
        });
      },
    });
  }

  public resetContributionState(): void {
    this.patchContributionState({ submitting: false, success: false, error: '' });
  }

  public patchAdminState(partialState: Partial<AdminGiftState>): void {
    this.adminState.update((s: AdminGiftState): AdminGiftState => ({ ...s, ...partialState }));
  }

  public patchGuestState(partialState: Partial<GuestGiftState>): void {
    this.guestState.update((s: GuestGiftState): GuestGiftState => ({ ...s, ...partialState }));
  }

  public patchContributionState(partialState: Partial<GiftContributionState>): void {
    this.contributionState.update((s: GiftContributionState): GiftContributionState => ({ ...s, ...partialState }));
  }
}
