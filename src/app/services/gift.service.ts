import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Gift } from '../models/gift.model';
import { Contribution } from '../models/contribution.model';
import { ContributionRequest } from '../models/contribution-request.model';
import { AdminGiftState } from '../models/admin-gift-state.model';

@Injectable({ providedIn: 'root' })
export class GiftService {
  public readonly base: string = environment.apiUrl;
  public readonly adminState: WritableSignal<AdminGiftState> = signal<AdminGiftState>({
    gifts: [],
    giftsLoading: false,
    giftsError: '',
    giftSaving: false,
    giftError: '',
    giftSaved: false,
  });

  public constructor(public readonly http: HttpClient) {}

  public getGifts(category?: string, search?: string): Observable<Gift[]> {
    let params = new HttpParams();
    if (category && category !== 'todos') params = params.set('category', category);
    if (search) params = params.set('search', search);
    return this.http.get<Gift[]>(`${this.base}/gifts`, { params });
  }

  public getGift(id: number): Observable<Gift> {
    return this.http.get<Gift>(`${this.base}/gifts/${id}`);
  }

  public contribute(giftId: number, payload: ContributionRequest): Observable<Contribution> {
    return this.http.post<Contribution>(`${this.base}/gifts/${giftId}/contribute`, payload);
  }

  public getAdminGifts(): Observable<Gift[]> {
    return this.http.get<Gift[]>(`${this.base}/admin/gifts`);
  }

  public createGift(gift: Partial<Gift>): Observable<Gift> {
    return this.http.post<Gift>(`${this.base}/admin/gifts`, gift);
  }

  public updateGift(id: number, gift: Partial<Gift>): Observable<Gift> {
    return this.http.put<Gift>(`${this.base}/admin/gifts/${id}`, gift);
  }

  public deleteGift(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/gifts/${id}`);
  }

  public loadAdminGifts(): void {
    this.patchAdminState({ giftsLoading: true, giftsError: '' });

    this.getAdminGifts().pipe(finalize((): void => this.patchAdminState({ giftsLoading: false }))).subscribe({
      next: (gifts: Gift[]): void => {
        this.patchAdminState({ gifts });
      },
      error: (): void => {
        this.patchAdminState({ giftsError: 'Erro ao carregar presentes.' });
      }
    });
  }

  public saveAdminGift(giftId: number | null, gift: Partial<Gift>): void {
    this.patchAdminState({ giftSaving: true, giftError: '', giftSaved: false });

    const request$: Observable<Gift> = giftId === null ? this.createGift(gift) : this.updateGift(giftId, gift);

    request$.pipe(finalize((): void => this.patchAdminState({ giftSaving: false }))).subscribe({
      next: (): void => {
        this.patchAdminState({ giftSaved: true });
        this.loadAdminGifts();
      },
      error: (): void => {
        this.patchAdminState({ giftError: 'Erro ao salvar presente.' });
      }
    });
  }

  public deleteAdminGift(id: number): void {
    this.patchAdminState({ giftsError: '' });

    this.deleteGift(id).subscribe({
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

  public patchAdminState(partialState: Partial<AdminGiftState>): void {
    this.adminState.update((currentState: AdminGiftState): AdminGiftState => ({ ...currentState, ...partialState }));
  }
}
