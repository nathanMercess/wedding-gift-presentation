import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardContributionByDay, DashboardGiftByCategory, DashboardPaymentByMethod, DashboardPaymentByStatus, DashboardRequestByStatus, DashboardResponse } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
  standalone: true,
  selector: 'app-super-admin-charts',
  templateUrl: './super-admin-charts.component.html',
  styleUrl: './super-admin-charts.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminChartsComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();

  public formatMoney(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMoney(value);
  }

  public formatMilliseconds(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMilliseconds(value);
  }

  public formatShortDate(value: string): string {
    return SuperAdminDashboardFormatUtil.formatShortDate(value);
  }

  public displayValue(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.displayValue(value);
  }

  public barWidth(value: number, maxValue: number): number {
    return SuperAdminDashboardFormatUtil.barWidth(value, maxValue);
  }

  public statusGroupBadgeClass(statusGroup: string): string {
    return SuperAdminDashboardFormatUtil.statusGroupBadgeClass(statusGroup);
  }

  public maxContributionChartValue(): number {
    return SuperAdminDashboardFormatUtil.max(this.dashboard().contributionsByDay.map((item: DashboardContributionByDay): number => this.contributionChartValue(item)));
  }

  public maxPaymentStatusCount(): number {
    return SuperAdminDashboardFormatUtil.max(this.dashboard().paymentsByStatus.map((item: DashboardPaymentByStatus): number => item.count));
  }

  public maxPaymentMethodCount(): number {
    return SuperAdminDashboardFormatUtil.max(this.dashboard().paymentsByMethod.map((item: DashboardPaymentByMethod): number => item.count));
  }

  public maxGiftCategoryAmount(): number {
    return SuperAdminDashboardFormatUtil.max(this.dashboard().giftsByCategory.map((item: DashboardGiftByCategory): number => Math.max(item.goalAmount, item.raisedAmount)));
  }

  public maxRequestStatusCount(): number {
    return SuperAdminDashboardFormatUtil.max(this.dashboard().requestsByStatus.map((item: DashboardRequestByStatus): number => item.count));
  }

  public contributionChartValue(item: DashboardContributionByDay): number {
    if (item.amount > 0)
      return item.amount;

    return item.count;
  }

  public contributionsLinePoints(): string {
    const items: DashboardContributionByDay[] = this.dashboard().contributionsByDay;

    if (items.length === 0)
      return '';

    const maxValue: number = this.maxContributionChartValue();

    if (maxValue <= 0)
      return '';

    return items.map((item: DashboardContributionByDay, index: number): string => {
      const x: number = items.length === 1 ? 50 : (index / (items.length - 1)) * 100;
      const y: number = 88 - (this.contributionChartValue(item) / maxValue) * 76;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }

  public contributionsAreaPoints(): string {
    const points: string = this.contributionsLinePoints();

    if (!points)
      return '';

    return `0,100 ${points} 100,100`;
  }

  public trackByPaymentStatus(_: number, item: DashboardPaymentByStatus): string {
    return item.status;
  }

  public trackByPaymentMethod(_: number, item: DashboardPaymentByMethod): string {
    return item.method;
  }

  public trackByGiftCategory(_: number, item: DashboardGiftByCategory): string {
    return item.category;
  }

  public trackByRequestStatus(_: number, item: DashboardRequestByStatus): string {
    return item.statusGroup;
  }

  public trackByIndex(index: number): number {
    return index;
  }
}
