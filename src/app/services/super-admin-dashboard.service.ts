import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { EMPTY_DASHBOARD_RESPONSE } from '../constants/empty-dashboard-response.constant';
import { ApiResponse } from '../models/api-response.model';
import { DashboardResponse } from '../models/dashboard-response.model';
import { PaymentReconciliationResponse } from '../models/payment-reconciliation-response.model';
import { SuperAdminDashboardState } from '../models/super-admin-dashboard-state.model';
import { ApiResponseUtil } from '../utils/api-response.util';
import { HttpErrorUtil } from '../utils/http-error';

export interface DashboardQueryParams {
  days: number;
  recentItems: number;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminDashboardService {
  public readonly state: WritableSignal<SuperAdminDashboardState> = signal<SuperAdminDashboardState>({
    hasDashboard: false,
    dashboard: EMPTY_DASHBOARD_RESPONSE,
    loading: false,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls, public readonly router: Router) {}

  public loadDashboard(params: DashboardQueryParams): void {
    this.patchState({ loading: true, error: '' });

    const httpParams: HttpParams = this.buildHttpParams(params);

    this.http.get<ApiResponse<DashboardResponse>>(this.endpointsUrls.adminDashboard, { params: httpParams })
      .pipe(
        ApiResponseUtil.data<DashboardResponse>('Erro ao carregar dashboard de SuperAdmin.'),
        finalize((): void => this.patchState({ loading: false })),
      )
      .subscribe({
        next: (dashboard: DashboardResponse): void => {
          this.patchState({ hasDashboard: true, dashboard });
        },
        error: (err: HttpErrorResponse): void => {
          if (HttpErrorUtil.isUnauthorized(err)) {
            this.router.navigate(['/admin/login']);
            return;
          }

          if (HttpErrorUtil.isForbidden(err)) {
            this.router.navigate(['/admin/access-denied']);
            return;
          }

          this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar dashboard de SuperAdmin.') });
        },
      });
  }

  public patchState(partialState: Partial<SuperAdminDashboardState>): void {
    this.state.update((currentState: SuperAdminDashboardState): SuperAdminDashboardState => ({ ...currentState, ...partialState }));
  }

  public reconcileApprovedPayments(): Observable<PaymentReconciliationResponse> {
    return this.http.post<ApiResponse<PaymentReconciliationResponse>>(this.endpointsUrls.adminPaymentsReconcileApproved, {})
      .pipe(ApiResponseUtil.data<PaymentReconciliationResponse>('Erro ao reconciliar pagamentos aprovados.'));
  }

  private buildHttpParams(params: DashboardQueryParams): HttpParams {
    let httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.set('days', String(params.days));
    httpParams = httpParams.set('recentItems', String(params.recentItems));
    return httpParams;
  }

}
