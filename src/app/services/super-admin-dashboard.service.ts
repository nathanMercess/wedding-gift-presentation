import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { EndpointsUrls } from '../constants/api-endpoints';
import { DashboardResponse } from '../models/dashboard-response.model';
import { SuperAdminDashboardState } from '../models/super-admin-dashboard-state.model';
import { HttpErrorUtil } from '../utils/http-error';

export interface DashboardQueryParams {
  days: number;
  recentItems: number;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminDashboardService {
  public readonly state: WritableSignal<SuperAdminDashboardState> = signal<SuperAdminDashboardState>({
    dashboard: null,
    loading: false,
    error: '',
  });

  public constructor(public readonly http: HttpClient, public readonly endpointsUrls: EndpointsUrls, public readonly router: Router) {}

  public loadDashboard(params: DashboardQueryParams): void {
    this.patchState({ loading: true, error: '' });

    let httpParams = new HttpParams();
    httpParams = httpParams.set('days', String(params.days));
    httpParams = httpParams.set('recentItems', String(params.recentItems));

    this.http.get<DashboardResponse>(this.endpointsUrls.adminDashboard, { params: httpParams })
      .pipe(finalize((): void => this.patchState({ loading: false })))
      .subscribe({
        next: (dashboard: DashboardResponse): void => {
          this.patchState({ dashboard });
        },
        error: (err: HttpErrorResponse): void => {
          if (err.status === 401)
            this.router.navigate(['/admin/login']);

          if (err.status === 403)
            this.router.navigate(['/admin/access-denied']);

          this.patchState({ error: HttpErrorUtil.extract(err, 'Erro ao carregar dashboard de SuperAdmin.') });
        },
      });
  }

  public patchState(partialState: Partial<SuperAdminDashboardState>): void {
    this.state.update((currentState: SuperAdminDashboardState): SuperAdminDashboardState => ({ ...currentState, ...partialState }));
  }
}
