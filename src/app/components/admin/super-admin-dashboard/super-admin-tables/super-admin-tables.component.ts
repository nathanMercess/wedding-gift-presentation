import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRecentContribution, DashboardRecentMessage, DashboardRecentPayment, DashboardRecentRequest, DashboardResponse } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
  standalone: true,
  selector: 'app-super-admin-tables',
  templateUrl: './super-admin-tables.component.html',
  styleUrl: './super-admin-tables.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminTablesComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();

  public formatMoney(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMoney(value);
  }

  public formatDate(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.formatDate(value);
  }

  public formatMilliseconds(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMilliseconds(value);
  }

  public formatBoolean(value: boolean): string {
    return SuperAdminDashboardFormatUtil.formatBoolean(value);
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

  public statusBadgeClass(status: string): string {
    return SuperAdminDashboardFormatUtil.statusBadgeClass(status);
  }

  public statusCodeBadgeClass(statusCode: number): string {
    return SuperAdminDashboardFormatUtil.statusCodeBadgeClass(statusCode);
  }

  public isSlowRequest(durationMilliseconds: number): boolean {
    return SuperAdminDashboardFormatUtil.isSlowRequest(durationMilliseconds);
  }

  public trackByRecentMessage(_: number, item: DashboardRecentMessage): string {
    return `${item.source}-${item.sourceId}`;
  }

  public trackByRecentPayment(_: number, item: DashboardRecentPayment): string {
    return item.id;
  }

  public trackByRecentContribution(_: number, item: DashboardRecentContribution): string {
    return item.id;
  }

  public trackByRecentRequest(_: number, item: DashboardRecentRequest): string {
    return item.id;
  }
}
