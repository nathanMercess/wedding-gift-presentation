import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { PaymentStatus } from '../checkout/enums/payment-status.enum';
import { EndpointsUrls } from '../constants/api-endpoints';
import { ContributionStatus } from '../enums/contribution-status.enum';
import { UserRole } from '../enums/user-role.enum';
import { AdminContribution } from '../models/admin-contribution.model';
import { AdminOperationsState } from '../models/admin-operations-state.model';
import { AdminPayment } from '../models/admin-payment.model';
import { AdminUser } from '../models/admin-user.model';
import { ApiResponse } from '../models/api-response.model';
import { CoupleOverview } from '../models/couple-overview.model';
import { PagedResult } from '../models/paged-result.model';
import { ApiResponseUtil } from '../utils/api-response.util';
import { HttpErrorUtil } from '../utils/http-error';

export interface AdminContributionQuery {
  search?: string;
  status?: ContributionStatus;
  hasMessage?: boolean;
  page: number;
  pageSize: number;
}

export interface AdminPaymentQuery {
  status?: PaymentStatus;
  method?: string;
  page: number;
  pageSize: number;
}

export interface AdminUserQuery {
  search?: string;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class AdminOperationsService {
  public readonly state: WritableSignal<AdminOperationsState> = signal<AdminOperationsState>({
    overview: null,
    contributions: [],
    contributionTotal: 0,
    contributionPages: 0,
    payments: [],
    paymentTotal: 0,
    paymentPages: 0,
    users: [],
    userTotal: 0,
    userPages: 0,
    loading: false,
    actionLoading: false,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls) {}

  public loadOverview(days: number = 30): void {
    this.patchState({ loading: true, error: '' });
    const params: HttpParams = new HttpParams().set('days', String(days));

    this.http.get<ApiResponse<CoupleOverview>>(this.endpointsUrls.adminOverview, { params })
      .pipe(
        ApiResponseUtil.data<CoupleOverview>('Erro ao carregar o resumo.'),
        finalize((): void => this.patchState({ loading: false })),
      )
      .subscribe({
        next: (overview: CoupleOverview): void => this.patchState({ overview }),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar o resumo.') }),
      });
  }

  public loadContributions(query: AdminContributionQuery): void {
    this.patchState({ loading: true, error: '' });
    let params: HttpParams = new HttpParams().set('page', String(query.page)).set('pageSize', String(query.pageSize));

    if (query.search)
      params = params.set('search', query.search);

    if (query.status)
      params = params.set('status', query.status);

    if (query.hasMessage)
      params = params.set('hasMessage', 'true');

    this.http.get<ApiResponse<PagedResult<AdminContribution>>>(this.endpointsUrls.adminContributions, { params })
      .pipe(
        ApiResponseUtil.data<PagedResult<AdminContribution>>('Erro ao carregar contribuições.'),
        finalize((): void => this.patchState({ loading: false })),
      )
      .subscribe({
        next: (result: PagedResult<AdminContribution>): void => this.patchState({ contributions: result.items, contributionTotal: result.totalCount, contributionPages: result.totalPages }),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar contribuições.') }),
      });
  }

  public markMessageRead(contribution: AdminContribution, read: boolean): void {
    this.patchState({ actionLoading: true, error: '' });
    this.http.patch<ApiResponse<AdminContribution>>(this.endpointsUrls.adminContributionMessageRead(contribution.id), { read })
      .pipe(
        ApiResponseUtil.data<AdminContribution>('Erro ao atualizar a mensagem.'),
        finalize((): void => this.patchState({ actionLoading: false })),
      )
      .subscribe({
        next: (updated: AdminContribution): void => this.replaceContribution(updated),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao atualizar a mensagem.') }),
      });
  }

  public archiveMessage(contribution: AdminContribution, archived: boolean): void {
    this.patchState({ actionLoading: true, error: '' });
    this.http.patch<ApiResponse<AdminContribution>>(this.endpointsUrls.adminContributionMessageArchive(contribution.id), { archived })
      .pipe(
        ApiResponseUtil.data<AdminContribution>('Erro ao arquivar a mensagem.'),
        finalize((): void => this.patchState({ actionLoading: false })),
      )
      .subscribe({
        next: (updated: AdminContribution): void => this.replaceContribution(updated),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao arquivar a mensagem.') }),
      });
  }

  public exportContributions(query: AdminContributionQuery): Observable<Blob> {
    let params: HttpParams = new HttpParams();

    if (query.search)
      params = params.set('search', query.search);

    if (query.status)
      params = params.set('status', query.status);

    if (query.hasMessage)
      params = params.set('hasMessage', 'true');

    return this.http.get(this.endpointsUrls.adminContributionsExport, { params, responseType: 'blob' });
  }

  public loadPayments(query: AdminPaymentQuery): void {
    this.patchState({ loading: true, error: '' });
    let params: HttpParams = new HttpParams().set('page', String(query.page)).set('pageSize', String(query.pageSize));

    if (query.status)
      params = params.set('status', query.status);

    if (query.method)
      params = params.set('method', query.method);

    this.http.get<ApiResponse<PagedResult<AdminPayment>>>(this.endpointsUrls.adminPayments, { params })
      .pipe(
        ApiResponseUtil.data<PagedResult<AdminPayment>>('Erro ao carregar pagamentos.'),
        finalize((): void => this.patchState({ loading: false })),
      )
      .subscribe({
        next: (result: PagedResult<AdminPayment>): void => this.patchState({ payments: result.items, paymentTotal: result.totalCount, paymentPages: result.totalPages }),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar pagamentos.') }),
      });
  }

  public refundPayment(payment: AdminPayment, onSuccess: () => void): void {
    this.patchState({ actionLoading: true, error: '' });
    this.http.post<ApiResponse<AdminPayment>>(this.endpointsUrls.adminPaymentRefund(payment.orderId), {})
      .pipe(
        ApiResponseUtil.data<AdminPayment>('Erro ao estornar o pagamento.'),
        finalize((): void => this.patchState({ actionLoading: false })),
      )
      .subscribe({
        next: (updated: AdminPayment): void => {
          this.state.update((currentState: AdminOperationsState): AdminOperationsState => ({ ...currentState, payments: currentState.payments.map((item: AdminPayment): AdminPayment => item.orderId === updated.orderId ? updated : item) }));
          onSuccess();
        },
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao estornar o pagamento.') }),
      });
  }

  public loadUsers(query: AdminUserQuery): void {
    this.patchState({ loading: true, error: '' });
    let params: HttpParams = new HttpParams().set('page', String(query.page)).set('pageSize', String(query.pageSize));

    if (query.search)
      params = params.set('search', query.search);

    this.http.get<ApiResponse<PagedResult<AdminUser>>>(this.endpointsUrls.adminUsers, { params })
      .pipe(
        ApiResponseUtil.data<PagedResult<AdminUser>>('Erro ao carregar usuários.'),
        finalize((): void => this.patchState({ loading: false })),
      )
      .subscribe({
        next: (result: PagedResult<AdminUser>): void => this.patchState({ users: result.items, userTotal: result.totalCount, userPages: result.totalPages }),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar usuários.') }),
      });
  }

  public updateUserActive(user: AdminUser, isActive: boolean): void {
    this.updateUser(this.endpointsUrls.adminUserActive(user.id), { isActive });
  }

  public updateUserRole(user: AdminUser, role: UserRole): void {
    this.updateUser(this.endpointsUrls.adminUserRole(user.id), { role });
  }

  public patchState(partialState: Partial<AdminOperationsState>): void {
    this.state.update((currentState: AdminOperationsState): AdminOperationsState => ({ ...currentState, ...partialState }));
  }

  private replaceContribution(updated: AdminContribution): void {
    this.state.update((currentState: AdminOperationsState): AdminOperationsState => ({ ...currentState, contributions: currentState.contributions.map((item: AdminContribution): AdminContribution => item.id === updated.id ? updated : item) }));
  }

  private updateUser(url: string, payload: object): void {
    this.patchState({ actionLoading: true, error: '' });
    this.http.patch<ApiResponse<AdminUser>>(url, payload)
      .pipe(
        ApiResponseUtil.data<AdminUser>('Erro ao atualizar o usuário.'),
        finalize((): void => this.patchState({ actionLoading: false })),
      )
      .subscribe({
        next: (updated: AdminUser): void => this.state.update((currentState: AdminOperationsState): AdminOperationsState => ({ ...currentState, users: currentState.users.map((item: AdminUser): AdminUser => item.id === updated.id ? updated : item) })),
        error: (err: HttpErrorResponse): void => this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao atualizar o usuário.') }),
      });
  }
}
