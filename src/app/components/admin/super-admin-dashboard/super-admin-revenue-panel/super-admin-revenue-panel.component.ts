import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { DashboardContributionByDay, DashboardResponse } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
  standalone: true,
  selector: 'app-super-admin-revenue-panel',
  templateUrl: './super-admin-revenue-panel.component.html',
  styleUrl: './super-admin-revenue-panel.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminRevenuePanelComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();

  public formatMoney(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMoney(value);
  }

  public formatPercent(value: number): string {
    return SuperAdminDashboardFormatUtil.formatPercent(value);
  }

  public formatShortDate(value: string): string {
    return SuperAdminDashboardFormatUtil.formatShortDate(value);
  }

  public formatDate(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.formatDate(value);
  }

  public progressPercent(value: number): number {
    return SuperAdminDashboardFormatUtil.progressPercent(value);
  }

  public maxContributionChartValue(): number {
    return SuperAdminDashboardFormatUtil.max(this.dashboard().contributionsByDay.map((item: DashboardContributionByDay): number => this.contributionChartValue(item)));
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

  public trackByDay(_: number, item: DashboardContributionByDay): string {
    return item.dateUtc;
  }
}
