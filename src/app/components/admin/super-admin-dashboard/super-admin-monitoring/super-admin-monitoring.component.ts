import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRequestByPath, DashboardResponse, DashboardTopGiftByRaised } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
  standalone: true,
  selector: 'app-super-admin-monitoring',
  templateUrl: './super-admin-monitoring.component.html',
  styleUrl: './super-admin-monitoring.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminMonitoringComponent {
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

  public formatMilliseconds(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMilliseconds(value);
  }

  public displayValue(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.displayValue(value);
  }

  public displayPath(path: string): string {
    return SuperAdminDashboardFormatUtil.displayPath(path);
  }

  public safeOperationalText(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.safeOperationalText(value);
  }

  public progressPercent(value: number): number {
    return SuperAdminDashboardFormatUtil.progressPercent(value);
  }

  public barWidth(value: number, maxValue: number): number {
    return SuperAdminDashboardFormatUtil.barWidth(value, maxValue);
  }

  public isSlowRequest(durationMilliseconds: number): boolean {
    return SuperAdminDashboardFormatUtil.isSlowRequest(durationMilliseconds);
  }

  public maxRequestPathCount(): number {
    return SuperAdminDashboardFormatUtil.max(this.dashboard().requestsByPath.map((item: DashboardRequestByPath): number => item.count));
  }

  public trackByRequestPath(_: number, item: DashboardRequestByPath): string {
    return `${item.method}-${item.path}`;
  }

  public trackByTopGift(_: number, item: DashboardTopGiftByRaised): string {
    return item.giftId;
  }

  public trackByIndex(index: number): number {
    return index;
  }
}
