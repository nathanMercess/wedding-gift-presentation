import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonSize } from '../../../enums/button-size.enum';
import { ButtonVariant } from '../../../enums/button-variant.enum';
import { DashboardActionItem, DashboardResponse } from '../../../models/dashboard-response.model';
import { PaymentReconciliationResponse } from '../../../models/payment-reconciliation-response.model';
import { AuthService } from '../../../services/auth.service';
import { SuperAdminDashboardService } from '../../../services/super-admin-dashboard.service';
import { HttpErrorUtil } from '../../../utils/http-error';
import { SuperAdminDashboardFormatUtil } from '../../../utils/super-admin-dashboard-format.util';
import { ButtonComponent } from '../../button/button.component';
import { SuperAdminActionCenterComponent } from './super-admin-action-center/super-admin-action-center.component';
import { SuperAdminActivityFeedComponent } from './super-admin-activity-feed/super-admin-activity-feed.component';
import { SuperAdminApiHealthComponent } from './super-admin-api-health/super-admin-api-health.component';
import { SuperAdminGiftInsightsComponent } from './super-admin-gift-insights/super-admin-gift-insights.component';
import { SuperAdminPaymentHealthComponent } from './super-admin-payment-health/super-admin-payment-health.component';
import { SuperAdminRevenuePanelComponent } from './super-admin-revenue-panel/super-admin-revenue-panel.component';

@Component({
    selector: 'app-super-admin-dashboard',
    templateUrl: './super-admin-dashboard.component.html',
    styleUrl: './super-admin-dashboard.component.scss',
    imports: [CommonModule, FormsModule, RouterLink, ButtonComponent, SuperAdminActionCenterComponent, SuperAdminActivityFeedComponent, SuperAdminApiHealthComponent, SuperAdminGiftInsightsComponent, SuperAdminPaymentHealthComponent, SuperAdminRevenuePanelComponent]
})
export class SuperAdminDashboardComponent implements OnInit {
  public readonly ButtonSize: typeof ButtonSize = ButtonSize;
  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly dayOptions: number[] = [7, 15, 30, 60, 90];
  public readonly recentItemsOptions: number[] = [5, 10, 20, 50];

  public days: number = 30;
  public recentItems: number = 10;
  public reconcilingPayments: boolean = false;
  public reconciliationMessage: string = '';

  public constructor(public readonly dashboardService: SuperAdminDashboardService, public readonly auth: AuthService) {}

  public ngOnInit(): void {
    this.loadDashboard();
  }

  public get dashboard(): DashboardResponse {
    return this.dashboardService.state().dashboard;
  }

  public get hasDashboard(): boolean {
    return this.dashboardService.state().hasDashboard;
  }

  public loadDashboard(): void {
    this.dashboardService.loadDashboard({ days: this.days, recentItems: this.recentItems });
  }

  public onFiltersChange(): void {
    this.loadDashboard();
  }

  public reconcileApprovedPayments(): void {
    if (this.reconcilingPayments)
      return;

    this.reconcilingPayments = true;
    this.reconciliationMessage = '';

    this.dashboardService.reconcileApprovedPayments()
      .pipe(finalize((): void => {
        this.reconcilingPayments = false;
      }))
      .subscribe({
        next: (response: PaymentReconciliationResponse): void => {
          this.reconciliationMessage = `Reconciliação concluída: ${response.createdCount} criadas, ${response.skippedCount} ignoradas, ${response.failedCount} falhas.`;
          this.loadDashboard();
        },
        error: (err: HttpErrorResponse): void => {
          this.reconciliationMessage = HttpErrorUtil.extract(err, 'Erro ao reconciliar pagamentos aprovados.');
        },
      });
  }

  public formatMoney(value: number): string {
    return SuperAdminDashboardFormatUtil.formatMoney(value);
  }

  public formatPercent(value: number): string {
    return SuperAdminDashboardFormatUtil.formatPercent(value);
  }

  public formatDate(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.formatDate(value);
  }

  public healthLabel(value: string): string {
    return SuperAdminDashboardFormatUtil.healthLabel(value);
  }

  public severityBadgeClass(value: string): string {
    return SuperAdminDashboardFormatUtil.severityBadgeClass(value);
  }

  public categoryStatus(category: string): string {
    const items: DashboardActionItem[] = this.dashboard.actionCenter.items.filter((item: DashboardActionItem): boolean => item.category === category);

    if (items.some((item: DashboardActionItem): boolean => item.severity === 'critical'))
      return 'critical';

    if (items.some((item: DashboardActionItem): boolean => item.severity === 'warning'))
      return 'warning';

    return 'healthy';
  }

  public categoryStatusLabel(category: string): string {
    return SuperAdminDashboardFormatUtil.healthLabel(this.categoryStatus(category));
  }

  public categoryStatusBadgeClass(category: string): string {
    return SuperAdminDashboardFormatUtil.severityBadgeClass(this.categoryStatus(category));
  }

  public logout(): void {
    this.auth.logout();
  }

  public trackByIndex(index: number): number {
    return index;
  }
}
