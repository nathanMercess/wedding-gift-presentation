import { DashboardResponse } from './dashboard-response.model';

export interface SuperAdminDashboardState {
  hasDashboard: boolean;
  dashboard: DashboardResponse;
  loading: boolean;
  error: string;
}
