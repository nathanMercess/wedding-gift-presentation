import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { GuestConfirmationState } from '../models/guest-confirmation-state.model';
import { GuestConfirmation, GuestConfirmationRequest, GuestSuggestion } from '../models/guest.model';
import { ApiResponseUtil } from '../utils/api-response.util';
import { HttpErrorUtil } from '../utils/http-error';

@Injectable({ providedIn: 'root' })
export class GuestConfirmationService {
  public readonly state: WritableSignal<GuestConfirmationState> = signal<GuestConfirmationState>({
    submitting: false,
    error: '',
    confirmation: null,
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls) {}

  public getSuggestions(search: string): Observable<GuestSuggestion[]> {
    const params: HttpParams = new HttpParams().set('search', search);
    return this.http.get<ApiResponse<GuestSuggestion[]>>(this.endpointsUrls.guestConfirmationSuggestions, { params })
      .pipe(ApiResponseUtil.data<GuestSuggestion[]>('Erro ao buscar convidados.'));
  }

  public confirm(request: GuestConfirmationRequest): void {
    this.patchState({ submitting: true, error: '', confirmation: null });
    this.http.post<ApiResponse<GuestConfirmation>>(this.endpointsUrls.guestConfirmations, request)
      .pipe(
        ApiResponseUtil.data<GuestConfirmation>('Erro ao confirmar presenças.'),
        finalize((): void => this.patchState({ submitting: false })),
      )
      .subscribe({
        next: (confirmation: GuestConfirmation): void => this.patchState({ confirmation }),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao confirmar presenças.') }),
      });
  }

  public reset(): void {
    this.patchState({ submitting: false, error: '', confirmation: null });
  }

  public patchState(partialState: Partial<GuestConfirmationState>): void {
    this.state.update((currentState: GuestConfirmationState): GuestConfirmationState => ({ ...currentState, ...partialState }));
  }
}
