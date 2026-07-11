import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { DashboardActionItem, DashboardResponse } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
    selector: 'app-super-admin-action-center',
    templateUrl: './super-admin-action-center.component.html',
    styleUrl: './super-admin-action-center.component.scss',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperAdminActionCenterComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();
  public readonly reconciling: InputSignal<boolean> = input<boolean>(false);
  public readonly reconcileApprovedPayments: OutputEmitterRef<void> = output<void>();

  public healthLabel(value: string): string {
    return SuperAdminDashboardFormatUtil.healthLabel(value);
  }

  public severityLabel(value: string): string {
    return SuperAdminDashboardFormatUtil.severityLabel(value);
  }

  public severityBadgeClass(value: string): string {
    return SuperAdminDashboardFormatUtil.severityBadgeClass(value);
  }

  public formatDate(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.formatDate(value);
  }

  public trackByActionItem(_: number, item: DashboardActionItem): string {
    return `${item.category}-${item.title}-${item.metric}`;
  }

  public canReconcileApprovedPayments(item: DashboardActionItem): boolean {
    return item.category === 'payments' && item.actionLabel.toLowerCase().includes('reprocessar');
  }
}
