import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardResponse } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
  standalone: true,
  selector: 'app-super-admin-summary',
  templateUrl: './super-admin-summary.component.html',
  styleUrl: './super-admin-summary.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminSummaryComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();
  public readonly slowRequestThresholdMilliseconds: number = SuperAdminDashboardFormatUtil.slowRequestThresholdMilliseconds;

  public formatMoney(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMoney(value);
  }

  public formatPercent(value: number): string {
    return SuperAdminDashboardFormatUtil.formatPercent(value);
  }

  public formatMilliseconds(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMilliseconds(value);
  }

  public progressPercent(value: number): number {
    return SuperAdminDashboardFormatUtil.progressPercent(value);
  }
}
