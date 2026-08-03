import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { GuestInvitationStatus } from '../enums/guest-invitation-status.enum';
import { GuestSource } from '../enums/guest-source.enum';
import { AdminGuestState } from '../models/admin-guest-state.model';
import { ApiResponse } from '../models/api-response.model';
import { GuestConfirmation, GuestConfirmationRequest, GuestInvitation, GuestInvitationImportResult, GuestSummary } from '../models/guest.model';
import { PagedResult } from '../models/paged-result.model';
import { ApiResponseUtil } from '../utils/api-response.util';
import { HttpErrorUtil } from '../utils/http-error';

export interface GuestInvitationQuery {
  search?: string;
  status?: GuestInvitationStatus;
  page: number;
  pageSize: number;
}

export interface GuestConfirmationQuery {
  search?: string;
  source?: GuestSource;
  fromUtc?: string;
  toUtc?: string;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class AdminGuestsService {
  public readonly state: WritableSignal<AdminGuestState> = signal<AdminGuestState>({
    summary: null,
    invitations: [],
    invitationTotal: 0,
    invitationPages: 0,
    confirmations: [],
    confirmationTotal: 0,
    confirmationPages: 0,
    loading: false,
    actionLoading: false,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls) {}

  public loadSummary(): void {
    this.http.get<ApiResponse<GuestSummary>>(this.endpointsUrls.adminGuestSummary)
      .pipe(ApiResponseUtil.data<GuestSummary>('Erro ao carregar o resumo de convidados.'))
      .subscribe({
        next: (summary: GuestSummary): void => this.patchState({ summary }),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar o resumo de convidados.') }),
      });
  }

  public loadInvitations(query: GuestInvitationQuery): void {
    this.patchState({ loading: true, error: '' });
    this.http.get<ApiResponse<PagedResult<GuestInvitation>>>(this.endpointsUrls.adminGuestInvitations, { params: this.invitationParams(query) })
      .pipe(ApiResponseUtil.data<PagedResult<GuestInvitation>>('Erro ao carregar a lista de convidados.'), finalize((): void => this.patchState({ loading: false })))
      .subscribe({
        next: (result: PagedResult<GuestInvitation>): void => this.patchState({ invitations: result.items, invitationTotal: result.totalCount, invitationPages: result.totalPages }),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar a lista de convidados.') }),
      });
  }

  public loadConfirmations(query: GuestConfirmationQuery): void {
    this.patchState({ loading: true, error: '' });
    this.http.get<ApiResponse<PagedResult<GuestConfirmation>>>(this.endpointsUrls.adminGuestConfirmations, { params: this.confirmationParams(query) })
      .pipe(ApiResponseUtil.data<PagedResult<GuestConfirmation>>('Erro ao carregar confirmações.'), finalize((): void => this.patchState({ loading: false })))
      .subscribe({
        next: (result: PagedResult<GuestConfirmation>): void => this.patchState({ confirmations: result.items, confirmationTotal: result.totalCount, confirmationPages: result.totalPages }),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar confirmações.') }),
      });
  }

  public saveInvitation(id: string | null, name: string, onSuccess: () => void): void {
    this.patchState({ actionLoading: true, error: '' });
    const request: Observable<ApiResponse<GuestInvitation>> = id
      ? this.http.put<ApiResponse<GuestInvitation>>(this.endpointsUrls.adminGuestInvitation(id), { name })
      : this.http.post<ApiResponse<GuestInvitation>>(this.endpointsUrls.adminGuestInvitations, { name });
    request.pipe(ApiResponseUtil.data<GuestInvitation>('Erro ao salvar o convidado.'), finalize((): void => this.patchState({ actionLoading: false })))
      .subscribe({
        next: (): void => { this.loadSummary(); onSuccess(); },
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao salvar o convidado.') }),
      });
  }

  public setInvitationActive(invitation: GuestInvitation, onSuccess: () => void): void {
    this.patchState({ actionLoading: true, error: '' });
    this.http.patch<ApiResponse<GuestInvitation>>(this.endpointsUrls.adminGuestInvitationActive(invitation.id), { isActive: !invitation.isActive })
      .pipe(ApiResponseUtil.data<GuestInvitation>('Erro ao atualizar o convidado.'), finalize((): void => this.patchState({ actionLoading: false })))
      .subscribe({ next: (): void => { this.loadSummary(); onSuccess(); }, error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao atualizar o convidado.') }) });
  }

  public deleteInvitation(id: string, onSuccess: () => void): void {
    this.delete(this.endpointsUrls.adminGuestInvitation(id), 'Erro ao excluir o convidado.', onSuccess);
  }

  public importInvitations(file: File, onSuccess: (result: GuestInvitationImportResult) => void): void {
    this.patchState({ actionLoading: true, error: '' });
    const formData: FormData = new FormData();
    formData.append('file', file);
    this.http.post<ApiResponse<GuestInvitationImportResult>>(`${this.endpointsUrls.adminGuestInvitations}/import`, formData)
      .pipe(ApiResponseUtil.data<GuestInvitationImportResult>('Erro ao importar convidados.'), finalize((): void => this.patchState({ actionLoading: false })))
      .subscribe({
        next: (result: GuestInvitationImportResult): void => { this.loadSummary(); onSuccess(result); },
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao importar convidados.') }),
      });
  }

  public updateConfirmation(id: string, request: GuestConfirmationRequest, onSuccess: () => void): void {
    this.patchState({ actionLoading: true, error: '' });
    this.http.put<ApiResponse<GuestConfirmation>>(this.endpointsUrls.adminGuestConfirmation(id), request)
      .pipe(ApiResponseUtil.data<GuestConfirmation>('Erro ao atualizar a confirmação.'), finalize((): void => this.patchState({ actionLoading: false })))
      .subscribe({ next: (): void => { this.loadSummary(); onSuccess(); }, error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao atualizar a confirmação.') }) });
  }

  public deleteConfirmation(id: string, onSuccess: () => void): void {
    this.delete(this.endpointsUrls.adminGuestConfirmation(id), 'Erro ao excluir a confirmação.', (): void => { this.loadSummary(); onSuccess(); });
  }

  public exportConfirmations(query: GuestConfirmationQuery): Observable<Blob> {
    return this.http.get(this.endpointsUrls.adminGuestConfirmationsExport, { params: this.confirmationParams(query), responseType: 'blob' });
  }

  public patchState(partialState: Partial<AdminGuestState>): void {
    this.state.update((currentState: AdminGuestState): AdminGuestState => ({ ...currentState, ...partialState }));
  }

  private delete(url: string, fallback: string, onSuccess: () => void): void {
    this.patchState({ actionLoading: true, error: '' });
    this.http.delete<void>(url)
      .pipe(finalize((): void => this.patchState({ actionLoading: false })))
      .subscribe({ next: (): void => onSuccess(), error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, fallback) }) });
  }

  private invitationParams(query: GuestInvitationQuery): HttpParams {
    let params: HttpParams = new HttpParams().set('page', String(query.page)).set('pageSize', String(query.pageSize));
    if (query.search)
      params = params.set('search', query.search);

    if (query.status)
      params = params.set('status', query.status);

    return params;
  }

  private confirmationParams(query: GuestConfirmationQuery): HttpParams {
    let params: HttpParams = new HttpParams().set('page', String(query.page)).set('pageSize', String(query.pageSize));
    if (query.search)
      params = params.set('search', query.search);

    if (query.source)
      params = params.set('source', query.source);

    if (query.fromUtc)
      params = params.set('fromUtc', query.fromUtc);

    if (query.toUtc)
      params = params.set('toUtc', query.toUtc);

    return params;
  }
}
