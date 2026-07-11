import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { DashboardPaymentByStatus, DashboardPaymentFailureReason, DashboardResponse } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
    selector: 'app-super-admin-payment-health',
    templateUrl: './super-admin-payment-health.component.html',
    styleUrl: './super-admin-payment-health.component.scss',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperAdminPaymentHealthComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();

  public formatMoney(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMoney(value);
  }

  public formatPercent(value: number): string {
    return SuperAdminDashboardFormatUtil.formatPercent(value);
  }

  public formatDate(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.formatDate(value);
  }

  public displayValue(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.displayValue(value);
  }

  public barWidth(value: number, maxValue: number): number {
    return SuperAdminDashboardFormatUtil.barWidth(value, maxValue);
  }

  public statusBadgeClass(status: string): string {
    return SuperAdminDashboardFormatUtil.statusBadgeClass(status);
  }

  public maxPaymentStatusCount(): number {
    return SuperAdminDashboardFormatUtil.max(this.dashboard().paymentsByStatus.map((item: DashboardPaymentByStatus): number => item.count));
  }

  public trackByPaymentStatus(_: number, item: DashboardPaymentByStatus): string {
    return item.status;
  }

  public trackByFailureReason(_: number, item: DashboardPaymentFailureReason): string {
    return item.statusDetail;
  }
}
