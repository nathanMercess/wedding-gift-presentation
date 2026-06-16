import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { ContributionRequest } from '../models/contribution-request.model';
import { AdminGiftState } from '../models/admin-gift-state.model';
import { GuestGiftState } from '../models/guest-gift-state.model';
import { GiftContributionState } from '../models/gift-contribution-state.model';
import { Gift } from '../models/gift.model';

@Injectable({ providedIn: 'root' })
export class GiftService {
  public readonly adminState: WritableSignal<AdminGiftState> = signal<AdminGiftState>({
    gifts: [],
    giftsLoading: false,
    giftsError: '',
    giftSaving: false,
    giftError: '',
    giftSaved: false,
  });
  public readonly guestState: WritableSignal<GuestGiftState> = signal<GuestGiftState>({
    gifts: [],
    loading: false,
    error: '',
  });
  public readonly contributionState: WritableSignal<GiftContributionState> = signal<GiftContributionState>({
    submitting: false,
    success: false,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls) {}

  public loadGuestGifts(category?: string, search?: string): void {
    this.patchGuestState({ loading: true, error: '' });

    let params = new HttpParams();
    if (category && category !== 'todos') params = params.set('category', category);
    if (search) params = params.set('search', search);

    this.http.get<Gift[]>(this.endpointsUrls.giftsList, { params }).pipe(finalize((): void => this.patchGuestState({ loading: false }))).subscribe({
      next: (gifts: Gift[]): void => {
        this.patchGuestState({ gifts });
      },
      error: (): void => {
        this.patchGuestState({ error: 'Nao foi possivel carregar os presentes.' });
      }
    });
  }

  public loadAdminGifts(): void {
    this.patchAdminState({ giftsLoading: true, giftsError: '' });

    this.http.get<Gift[]>(this.endpointsUrls.adminGiftsList).pipe(finalize((): void => this.patchAdminState({ giftsLoading: false }))).subscribe({
      next: (gifts: Gift[]): void => {
        this.patchAdminState({ gifts });
      },
      error: (): void => {
        this.patchAdminState({ giftsError: 'Erro ao carregar presentes.' });
      }
    });
  }

  public saveAdminGift(giftId: string | null, gift: Partial<Gift>): void {
    this.patchAdminState({ giftSaving: true, giftError: '', giftSaved: false });

    if (giftId === null) {
      this.http.post<Gift>(this.endpointsUrls.adminGiftsList, gift).pipe(finalize((): void => this.patchAdminState({ giftSaving: false }))).subscribe({
        next: (): void => {
          this.patchAdminState({ giftSaved: true });
          this.loadAdminGifts();
        },
        error: (): void => {
          this.patchAdminState({ giftError: 'Erro ao salvar presente.' });
        }
      });
      return;
    }

    this.http.put<Gift>(this.endpointsUrls.adminGiftsById(giftId), gift).pipe(finalize((): void => this.patchAdminState({ giftSaving: false }))).subscribe({
      next: (): void => {
        this.patchAdminState({ giftSaved: true });
        this.loadAdminGifts();
      },
      error: (): void => {
        this.patchAdminState({ giftError: 'Erro ao salvar presente.' });
      }
    });
  }

  public deleteAdminGift(id: string): void {
    this.patchAdminState({ giftsError: '' });

    this.http.delete<void>(this.endpointsUrls.adminGiftsById(id)).subscribe({
      next: (): void => {
        this.loadAdminGifts();
      },
      error: (): void => {
        this.patchAdminState({ giftsError: 'Erro ao remover presente.' });
      }
    });
  }

  public clearAdminGiftError(): void {
    this.patchAdminState({ giftError: '' });
  }

  public resetAdminGiftSaved(): void {
    this.patchAdminState({ giftSaved: false });
  }

  public contributeToGift(giftId: string, payload: ContributionRequest, onSuccess?: () => void): void {
    this.patchContributionState({ submitting: true, success: false, error: '' });

    this.http.post<void>(this.endpointsUrls.giftsContribute(giftId), payload).pipe(finalize((): void => this.patchContributionState({ submitting: false }))).subscribe({
      next: (): void => {
        this.patchContributionState({ success: true });
        this.loadGuestGifts();
        if (onSuccess) onSuccess();
      },
      error: (): void => {
        this.patchContributionState({ error: 'Erro ao registrar contribuicao. Tente novamente.' });
      }
    });
  }

  public resetContributionState(): void {
    this.patchContributionState({ submitting: false, success: false, error: '' });
  }

  public patchAdminState(partialState: Partial<AdminGiftState>): void {
    this.adminState.update((currentState: AdminGiftState): AdminGiftState => ({ ...currentState, ...partialState }));
  }

  public patchGuestState(partialState: Partial<GuestGiftState>): void {
    this.guestState.update((currentState: GuestGiftState): GuestGiftState => ({ ...currentState, ...partialState }));
  }

  public patchContributionState(partialState: Partial<GiftContributionState>): void {
    this.contributionState.update((currentState: GiftContributionState): GiftContributionState => ({ ...currentState, ...partialState }));
  }
}
