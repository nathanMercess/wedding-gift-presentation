import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { GiftCategory } from '../enums/gift-category.enum';
import { GiftSortField } from '../enums/GiftSortField';
import { SortDirection } from '../enums/SortDirection';
import { AdminGiftState } from '../models/admin-gift-state.model';
import { ApiResponse } from '../models/api-response.model';
import { ContributionRequest } from '../models/contribution-request.model';
import { GiftContributionState } from '../models/gift-contribution-state.model';
import { Gift } from '../models/gift.model';
import { GuestGiftState } from '../models/guest-gift-state.model';
import { ImageUploadResponse } from '../models/image-upload-response.model';
import { PagedResult } from '../models/paged-result.model';
import { ApiResponseUtil } from '../utils/api-response.util';
import { HttpErrorUtil } from '../utils/http-error';

export interface GiftQueryParams {
  search?: string;
  category?: GiftCategory;
  minTotal?: number;
  maxTotal?: number;
  orderBy?: GiftSortField;
  orderDir?: SortDirection;
  onlyAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GiftStats {
  total: number;
  completed: number;
  contributors?: number;
  raised: number;
  goal: number;
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
    overallContributors: 0,
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

    this.http.get<ApiResponse<PagedResult<Gift>>>(this.endpointsUrls.giftsList, { params: this.buildGiftParams(params) })
      .pipe(
        ApiResponseUtil.data<PagedResult<Gift>>('Nao foi possivel carregar os presentes.'),
        finalize((): void => this.patchGuestState({ loading: false })),
      )
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
          this.patchGuestState({ error: HttpErrorUtil.extract(err, 'Nao foi possivel carregar os presentes.') });
        },
      });
  }

  public loadGuestGiftById(giftId: string, onSuccess: (gift: Gift) => void, onError?: (message: string) => void): void {
    this.http.get<ApiResponse<Gift>>(this.endpointsUrls.giftsById(giftId))
      .pipe(ApiResponseUtil.data<Gift>('Nao foi possivel conferir este presente.'))
      .subscribe({
        next: (gift: Gift): void => onSuccess(gift),
        error: (err: HttpErrorResponse): void => {
          if (!onError)
            return;

          onError(HttpErrorUtil.extract(err, 'Nao foi possivel conferir este presente.'));
        },
      });
  }

  public refreshGuestGiftsSilently(params: GiftQueryParams = {}): void {
    this.http.get<ApiResponse<PagedResult<Gift>>>(this.endpointsUrls.giftsList, { params: this.buildGiftParams(params) })
      .pipe(ApiResponseUtil.data<PagedResult<Gift>>('Nao foi possivel carregar os presentes.'))
      .subscribe({
        next: (result: PagedResult<Gift>): void => {
          this.patchGuestState({
            gifts: result.items,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.page,
          });
        },
        error: (): void => {},
      });
  }

  public loadAdminGifts(params: GiftQueryParams = {}): void {
    this.patchAdminState({ giftsLoading: true, giftsError: '' });

    this.http.get<ApiResponse<PagedResult<Gift>>>(this.endpointsUrls.adminGiftsList, { params: this.buildGiftParams(params) })
      .pipe(
        ApiResponseUtil.data<PagedResult<Gift>>('Erro ao carregar presentes.'),
        finalize((): void => this.patchAdminState({ giftsLoading: false })),
      )
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

  public refreshAdminGiftsSilently(params: GiftQueryParams = {}): void {
    this.http.get<ApiResponse<PagedResult<Gift>>>(this.endpointsUrls.adminGiftsList, { params: this.buildGiftParams(params) })
      .pipe(ApiResponseUtil.data<PagedResult<Gift>>('Erro ao carregar presentes.'))
      .subscribe({
        next: (result: PagedResult<Gift>): void => {
          this.patchAdminState({
            gifts: result.items,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.page,
          });
        },
        error: (): void => {},
      });
  }

  public saveAdminGift(giftId: string, gift: Partial<Gift>): void {
    this.patchAdminState({ giftSaving: true, giftError: '', giftSaved: false });

    if (!giftId) {
      this.http.post<ApiResponse<Gift>>(this.endpointsUrls.adminGiftsList, gift)
        .pipe(
          ApiResponseUtil.data<Gift>('Erro ao salvar presente.'),
          finalize((): void => this.patchAdminState({ giftSaving: false })),
        )
        .subscribe({
          next: (created: Gift): void => {
            this.adminState.update((s: AdminGiftState): AdminGiftState => ({
              ...s,
              gifts: [created, ...s.gifts],
              totalCount: s.totalCount + 1,
              giftSaved: true,
            }));
          },
          error: (err: HttpErrorResponse): void => {
            this.patchAdminState({ giftError: HttpErrorUtil.extract(err, 'Erro ao salvar presente.') });
          },
        });
      return;
    }

    const snapshot: Gift[] = this.adminState().gifts;
    const optimistic: Gift[] = snapshot.map((g: Gift): Gift => g.id === giftId ? { ...g, ...gift, id: giftId } : g);
    this.patchAdminState({ gifts: optimistic });

    this.http.put<ApiResponse<Gift>>(this.endpointsUrls.adminGiftsById(giftId), gift)
      .pipe(
        ApiResponseUtil.data<Gift>('Erro ao salvar presente.'),
        finalize((): void => this.patchAdminState({ giftSaving: false })),
      )
      .subscribe({
        next: (saved: Gift): void => {
          this.adminState.update((s: AdminGiftState): AdminGiftState => ({
            ...s,
            gifts: s.gifts.map((g: Gift): Gift => g.id === giftId ? saved : g),
            giftSaved: true,
          }));
        },
        error: (err: HttpErrorResponse): void => {
          this.patchAdminState({ gifts: snapshot, giftError: HttpErrorUtil.extract(err, 'Erro ao salvar presente.') });
        },
      });
  }

  public deleteAdminGift(id: string): void {
    const snapshot: Gift[] = this.adminState().gifts;
    const snapshotCount: number = this.adminState().totalCount;

    this.patchAdminState({
      giftsError: '',
      gifts: snapshot.filter((g: Gift): boolean => g.id !== id),
      totalCount: Math.max(0, snapshotCount - 1),
    });

    this.http.delete<ApiResponse<null>>(this.endpointsUrls.adminGiftsById(id))
      .pipe(ApiResponseUtil.nullableData<null>('Erro ao remover presente.'))
      .subscribe({
        error: (err: HttpErrorResponse): void => {
          this.patchAdminState({ gifts: snapshot, totalCount: snapshotCount, giftsError: HttpErrorUtil.extract(err, 'Erro ao remover presente.') });
        },
      });
  }

  public saveAdminGiftsBatch(gifts: Gift[], category: GiftCategory | null, onSuccess: () => void): void {
    if (gifts.length === 0)
      return;

    this.patchAdminState({ giftSaving: true, giftError: '' });
    forkJoin(gifts.map((gift: Gift) => this.http.put<ApiResponse<Gift>>(this.endpointsUrls.adminGiftsById(gift.id), { ...gift, category }).pipe(ApiResponseUtil.data<Gift>('Erro ao atualizar presentes.'))))
      .pipe(finalize((): void => this.patchAdminState({ giftSaving: false })))
      .subscribe({
        next: (savedGifts: Gift[]): void => {
          const savedById: Map<string, Gift> = new Map(savedGifts.map((gift: Gift): [string, Gift] => [gift.id, gift]));
          this.adminState.update((state: AdminGiftState): AdminGiftState => ({ ...state, gifts: state.gifts.map((gift: Gift): Gift => savedById.get(gift.id) ?? gift) }));
          onSuccess();
        },
        error: (err: HttpErrorResponse): void => this.patchAdminState({ giftError: HttpErrorUtil.extract(err, 'Erro ao atualizar presentes.') }),
      });
  }

  public deleteAdminGiftsBatch(gifts: Gift[], onSuccess: () => void): void {
    if (gifts.length === 0)
      return;

    this.patchAdminState({ giftSaving: true, giftsError: '' });
    forkJoin(gifts.map((gift: Gift) => this.http.delete<ApiResponse<null>>(this.endpointsUrls.adminGiftsById(gift.id)).pipe(ApiResponseUtil.nullableData<null>('Erro ao remover presentes.'))))
      .pipe(finalize((): void => this.patchAdminState({ giftSaving: false })))
      .subscribe({
        next: (): void => {
          const deletedIds: Set<string> = new Set(gifts.map((gift: Gift): string => gift.id));
          this.adminState.update((state: AdminGiftState): AdminGiftState => ({ ...state, gifts: state.gifts.filter((gift: Gift): boolean => !deletedIds.has(gift.id)), totalCount: Math.max(0, state.totalCount - deletedIds.size) }));
          onSuccess();
        },
        error: (err: HttpErrorResponse): void => this.patchAdminState({ giftsError: HttpErrorUtil.extract(err, 'Erro ao remover presentes.') }),
      });
  }

  public createAdminGiftsBatch(gifts: Array<Partial<Gift>>, onSuccess: () => void): void {
    if (gifts.length === 0)
      return;

    this.patchAdminState({ giftSaving: true, giftError: '' });
    forkJoin(gifts.map((gift: Partial<Gift>) => this.http.post<ApiResponse<Gift>>(this.endpointsUrls.adminGiftsList, gift).pipe(ApiResponseUtil.data<Gift>('Erro ao importar presentes.'))))
      .pipe(finalize((): void => this.patchAdminState({ giftSaving: false })))
      .subscribe({
        next: (created: Gift[]): void => {
          this.adminState.update((state: AdminGiftState): AdminGiftState => ({ ...state, gifts: [...created, ...state.gifts], totalCount: state.totalCount + created.length }));
          onSuccess();
        },
        error: (err: HttpErrorResponse): void => this.patchAdminState({ giftError: HttpErrorUtil.extract(err, 'Erro ao importar presentes.') }),
      });
  }

  public duplicateAdminGift(gift: Gift): void {
    this.saveAdminGift('', { ...gift, id: undefined, name: `${gift.name} (cópia)`, raised: 0, fullyFunded: false });
  }

  public clearAdminGiftError(): void {
    this.patchAdminState({ giftError: '' });
  }

  public uploadGiftImage(file: File, onSuccess: (url: string) => void, onError?: () => void): void {
    this.patchAdminState({ imageUploading: true, imageUploadError: '' });

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<ApiResponse<ImageUploadResponse>>(this.endpointsUrls.adminUploadImage, formData)
      .pipe(
        ApiResponseUtil.data<ImageUploadResponse>('Erro ao enviar a imagem.'),
        finalize((): void => this.patchAdminState({ imageUploading: false })),
      )
      .subscribe({
        next: (response: ImageUploadResponse): void => {
          onSuccess(response.url);
        },
        error: (err: HttpErrorResponse): void => {
          this.patchAdminState({ imageUploadError: HttpErrorUtil.extract(err, 'Erro ao enviar a imagem.') });

          if (onError)
            onError();
        },
      });
  }

  public resetAdminGiftSaved(): void {
    this.patchAdminState({ giftSaved: false });
  }

  public contributeToGift(giftId: string, payload: ContributionRequest, onSuccess?: () => void): void {
    this.patchContributionState({ submitting: true, success: false, error: '' });

    this.http.post<ApiResponse<null>>(this.endpointsUrls.giftsContribute(giftId), payload)
      .pipe(
        ApiResponseUtil.nullableData<null>('Erro ao registrar contribuicao. Tente novamente.'),
        finalize((): void => this.patchContributionState({ submitting: false })),
      )
      .subscribe({
        next: (): void => {
          this.patchContributionState({ success: true });
          this.loadGuestGifts();

          if (onSuccess)
            onSuccess();
        },
        error: (err: HttpErrorResponse): void => {
          this.patchContributionState({ error: HttpErrorUtil.extract(err, 'Erro ao registrar contribuicao. Tente novamente.') });
        },
      });
  }

  public loadGuestStats(): void {
    this.http.get<ApiResponse<GiftStats>>(this.endpointsUrls.giftsStats)
      .pipe(ApiResponseUtil.data<GiftStats>('Erro ao carregar estatisticas dos presentes.'))
      .subscribe({
        next: (stats: GiftStats): void => {
          this.patchGuestState({
            overallTotal: stats.total,
            overallCompleted: stats.completed,
            overallContributors: stats.contributors ?? stats.completed,
            overallRaised: stats.raised,
            overallGoal: stats.goal,
          });
        },
        error: (): void => {},
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

  private buildGiftParams(params: GiftQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.search)
      httpParams = httpParams.set('search', params.search);

    if (params.category)
      httpParams = httpParams.set('category', params.category);

    if (params.minTotal !== undefined)
      httpParams = httpParams.set('minTotal', String(params.minTotal));

    if (params.maxTotal !== undefined)
      httpParams = httpParams.set('maxTotal', String(params.maxTotal));

    httpParams = httpParams.set('orderBy', params.orderBy ?? GiftSortField.Total);
    httpParams = httpParams.set('orderDir', params.orderDir ?? SortDirection.Asc);

    if (params.onlyAvailable !== undefined)
      httpParams = httpParams.set('onlyAvailable', String(params.onlyAvailable));

    if (params.page)
      httpParams = httpParams.set('page', String(params.page));

    if (params.pageSize)
      httpParams = httpParams.set('pageSize', String(params.pageSize));

    return httpParams;
  }
}
