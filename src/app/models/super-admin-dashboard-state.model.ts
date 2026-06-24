import { DashboardResponse } from './dashboard-response.model';

export interface SuperAdminDashboardState {
  dashboard: DashboardResponse | null;
  loading: boolean;
  error: string;
}
