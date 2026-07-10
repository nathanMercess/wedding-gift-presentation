import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { DashboardResponse, DashboardTopGiftByRaised } from '../../../../models/dashboard-response.model';
import { SuperAdminDashboardFormatUtil } from '../../../../utils/super-admin-dashboard-format.util';

@Component({
  standalone: true,
  selector: 'app-super-admin-gift-insights',
  templateUrl: './super-admin-gift-insights.component.html',
  styleUrl: './super-admin-gift-insights.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminGiftInsightsComponent {
  public readonly dashboard: InputSignal<DashboardResponse> = input.required<DashboardResponse>();

  public formatMoney(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMoney(value);
  }

  public formatPercent(value: number): string {
    return SuperAdminDashboardFormatUtil.formatPercent(value);
  }

  public progressPercent(value: number): number {
    return SuperAdminDashboardFormatUtil.progressPercent(value);
  }

  public trackByGift(_: number, item: DashboardTopGiftByRaised): string {
    return item.giftId;
  }
}
