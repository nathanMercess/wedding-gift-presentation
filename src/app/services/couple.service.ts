import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Couple } from '../models/couple.model';
import { CoupleState } from '../models/couple-state.model';

@Injectable({ providedIn: 'root' })
export class CoupleService {
  public readonly base: string = environment.apiUrl;
  public readonly state: WritableSignal<CoupleState> = signal<CoupleState>({
    couple: { names: '', weddingDate: '', photo: '', message: '' },
    loading: false,
    saving: false,
    success: false,
    error: '',
  });

  public constructor(public readonly http: HttpClient) {}

  public getCouple(): Observable<Couple> {
    return this.http.get<Couple>(`${this.base}/couple`);
  }

  public updateCouple(couple: Partial<Couple>): Observable<Couple> {
    return this.http.put<Couple>(`${this.base}/admin/couple`, couple);
  }

  public loadCouple(): void {
    this.patchState({ loading: true, error: '' });

    this.getCouple().pipe(finalize((): void => this.patchState({ loading: false }))).subscribe({
      next: (couple: Couple): void => {
        this.patchState({ couple });
      },
      error: (): void => {
        this.patchState({ error: 'Erro ao carregar informações do casal.' });
      }
    });
  }

  public saveCouple(couple: Partial<Couple>): void {
    this.patchState({ saving: true, success: false, error: '' });

    this.updateCouple(couple).pipe(finalize((): void => this.patchState({ saving: false }))).subscribe({
      next: (updatedCouple: Couple): void => {
        this.patchState({ couple: updatedCouple, success: true });
      },
      error: (): void => {
        this.patchState({ error: 'Erro ao salvar informações do casal.' });
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
