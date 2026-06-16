import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { Couple } from '../models/couple.model';
import { CoupleState } from '../models/couple-state.model';
import { HttpErrorUtil } from '../utils/http-error';

@Injectable({ providedIn: 'root' })
export class CoupleService {
  public readonly state: WritableSignal<CoupleState> = signal<CoupleState>({
    couple: { names: '', weddingDate: '', photo: '', message: '' },
    loading: false,
    saving: false,
    success: false,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls) {}

  public loadCouple(): void {
    this.patchState({ loading: true, error: '' });

    this.http.get<Couple>(this.endpointsUrls.coupleGet).pipe(finalize((): void => this.patchState({ loading: false }))).subscribe({
      next: (couple: Couple): void => {
        this.patchState({ couple });
      },
      error: (err: HttpErrorResponse): void => {
        this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar informações do casal.') });
      }
    });
  }

  public saveCouple(couple: Partial<Couple>): void {
    this.patchState({ saving: true, success: false, error: '' });

    this.http.put<Couple>(this.endpointsUrls.coupleAdminUpdate, couple).pipe(finalize((): void => this.patchState({ saving: false }))).subscribe({
      next: (updatedCouple: Couple): void => {
        this.patchState({ couple: updatedCouple, success: true });
      },
      error: (err: HttpErrorResponse): void => {
        this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao salvar informações do casal.') });
      }
    });
  }

  public clearCoupleFeedback(): void {
    this.patchState({ success: false, error: '' });
  }

  public patchState(partialState: Partial<CoupleState>): void {
    this.state.update((currentState: CoupleState): CoupleState => ({ ...currentState, ...partialState }));
  }
}
