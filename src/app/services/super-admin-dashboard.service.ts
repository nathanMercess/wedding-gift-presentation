import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, forkJoin } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { EMPTY_DASHBOARD_RESPONSE } from '../constants/empty-dashboard-response.constant';
import { ApiResponse } from '../models/api-response.model';
import { DashboardActionCenter, DashboardActivityFeedItem, DashboardApiHealth, DashboardCharts, DashboardGiftInsights, DashboardOverviewResponse, DashboardPaymentHealth, DashboardResponse, DashboardRevenue } from '../models/dashboard-response.model';
import { PaymentReconciliationResponse } from '../models/payment-reconciliation-response.model';
import { SuperAdminDashboardState } from '../models/super-admin-dashboard-state.model';
import { ApiResponseUtil } from '../utils/api-response.util';
import { HttpErrorUtil } from '../utils/http-error';

export interface DashboardQueryParams {
  days: number;
  recentItems: number;
}

interface DashboardSections {
  overview: DashboardOverviewResponse;
  charts: DashboardCharts;
  actionCenter: DashboardActionCenter;
  revenue: DashboardRevenue;
  paymentHealth: DashboardPaymentHealth;
  giftInsights: DashboardGiftInsights;
  apiHealth: DashboardApiHealth;
  activityFeed: DashboardActivityFeedItem[];
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

    forkJoin({
      overview: this.getSection<DashboardOverviewResponse>(this.endpointsUrls.adminDashboardOverview, httpParams),
      charts: this.getSection<DashboardCharts>(this.endpointsUrls.adminDashboardCharts, httpParams),
      actionCenter: this.getSection<DashboardActionCenter>(this.endpointsUrls.adminDashboardActionCenter, httpParams),
      revenue: this.getSection<DashboardRevenue>(this.endpointsUrls.adminDashboardRevenue, httpParams),
      paymentHealth: this.getSection<DashboardPaymentHealth>(this.endpointsUrls.adminDashboardPaymentHealth, httpParams),
      giftInsights: this.getSection<DashboardGiftInsights>(this.endpointsUrls.adminDashboardGiftInsights, httpParams),
      apiHealth: this.getSection<DashboardApiHealth>(this.endpointsUrls.adminDashboardApiHealth, httpParams),
      activityFeed: this.getSection<DashboardActivityFeedItem[]>(this.endpointsUrls.adminDashboardActivityFeed, httpParams),
    })
      .pipe(finalize((): void => this.patchState({ loading: false })))
      .subscribe({
        next: (sections: DashboardSections): void => {
          this.patchState({ hasDashboard: true, dashboard: this.toDashboardResponse(sections) });
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

  private getSection<T>(url: string, params: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(url, { params })
      .pipe(ApiResponseUtil.data<T>('Erro ao carregar dashboard de SuperAdmin.'));
  }

  private toDashboardResponse(sections: DashboardSections): DashboardResponse {
    return {
      ...EMPTY_DASHBOARD_RESPONSE,
      generatedAtUtc: sections.overview.generatedAtUtc,
      period: sections.overview.period,
      overview: sections.overview.overview,
      gifts: sections.overview.gifts,
      contributions: sections.overview.contributions,
      payments: sections.overview.payments,
      messages: sections.overview.messages,
      requests: sections.overview.requests,
      monitoring: sections.overview.monitoring,
      actionCenter: sections.actionCenter,
      revenue: sections.revenue,
      paymentHealth: sections.paymentHealth,
      giftInsights: sections.giftInsights,
      apiHealth: sections.apiHealth,
      contributionsByDay: sections.charts.contributionsByDay,
      paymentsByStatus: sections.charts.paymentsByStatus,
      topGiftsByRaised: sections.giftInsights.topRaisedGifts,
      activityFeed: sections.activityFeed,
    };
  }
}
