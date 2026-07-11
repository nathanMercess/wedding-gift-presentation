import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { DashboardApiEndpointHealth, DashboardResponse } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
    selector: 'app-super-admin-api-health',
    templateUrl: './super-admin-api-health.component.html',
    styleUrl: './super-admin-api-health.component.scss',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperAdminApiHealthComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();

  public formatPercent(value: number): string {
    return SuperAdminDashboardFormatUtil.formatPercent(value);
  }

  public formatMilliseconds(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMilliseconds(value);
  }

  public formatDate(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.formatDate(value);
  }

  public displayPath(path: string): string {
    return SuperAdminDashboardFormatUtil.displayPath(path);
  }

  public trackByEndpoint(_: number, item: DashboardApiEndpointHealth): string {
    return `${item.method}-${item.path}`;
  }
}
