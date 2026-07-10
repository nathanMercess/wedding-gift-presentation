import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { DashboardActivityFeedItem, DashboardResponse } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
  standalone: true,
  selector: 'app-super-admin-activity-feed',
  templateUrl: './super-admin-activity-feed.component.html',
  styleUrl: './super-admin-activity-feed.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminActivityFeedComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();

  public formatMoney(value: number | null): string {
    if (value === null)
      return '';

    return SuperAdminDashboardFormatUtil.formatMoney(value);
  }

  public formatDate(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.formatDate(value);
  }

  public severityLabel(value: string): string {
    return SuperAdminDashboardFormatUtil.severityLabel(value);
  }

  public severityBadgeClass(value: string): string {
    return SuperAdminDashboardFormatUtil.severityBadgeClass(value);
  }

  public safeOperationalText(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.safeOperationalText(value);
  }

  public displayValue(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.displayValue(value);
  }

  public trackByActivity(_: number, item: DashboardActivityFeedItem): string {
    return `${item.type}-${item.occurredAtUtc}-${item.title}-${item.correlationId ?? ''}`;
  }
}
