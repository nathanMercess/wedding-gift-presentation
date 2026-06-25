import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../button/button.component';
import { DashboardResponse } from '../../../models/dashboard-response.model';
import { AuthService } from '../../../services/auth.service';
import { SuperAdminDashboardService } from '../../../services/super-admin-dashboard.service';
import { ButtonSize } from '../../../enums/button-size.enum';
import { ButtonVariant } from '../../../enums/button-variant.enum';
import { SuperAdminDashboardTab } from '../../../enums/super-admin-dashboard-tab.enum';
import { SuperAdminDashboardFormatUtil } from '../../../utils/super-admin-dashboard-format.util';
import { SuperAdminChartsComponent } from './super-admin-charts/super-admin-charts.component';
import { SuperAdminMonitoringComponent } from './super-admin-monitoring/super-admin-monitoring.component';
import { SuperAdminSummaryComponent } from './super-admin-summary/super-admin-summary.component';
import { SuperAdminTablesComponent } from './super-admin-tables/super-admin-tables.component';

@Component({
  standalone: true,
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss',
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent, SuperAdminChartsComponent, SuperAdminMonitoringComponent, SuperAdminSummaryComponent, SuperAdminTablesComponent],
})
export class SuperAdminDashboardComponent implements OnInit {
  public readonly ButtonSize: typeof ButtonSize = ButtonSize;
  public readonly ButtonVariant: typeof ButtonVariant = ButtonVariant;
  public readonly SuperAdminDashboardTab: typeof SuperAdminDashboardTab = SuperAdminDashboardTab;
  public readonly dayOptions: number[] = [7, 15, 30, 60, 90];
  public readonly recentItemsOptions: number[] = [5, 10, 20, 50];
  public readonly tabs: SuperAdminDashboardTab[] = [
    SuperAdminDashboardTab.Overview,
    SuperAdminDashboardTab.Charts,
    SuperAdminDashboardTab.Tables,
    SuperAdminDashboardTab.Monitoring,
  ];

  public activeTab: SuperAdminDashboardTab = SuperAdminDashboardTab.Overview;
  public days: number = 30;
  public recentItems: number = 10;

  public constructor(public readonly dashboardService: SuperAdminDashboardService, public readonly auth: AuthService) {}

  public ngOnInit(): void {
    this.loadDashboard();
  }

  public get dashboard(): DashboardResponse | null {
    return this.dashboardService.state().dashboard;
  }

  public loadDashboard(): void {
    this.dashboardService.loadDashboard({ days: this.days, recentItems: this.recentItems });
  }

  public onFiltersChange(): void {
    this.loadDashboard();
  }

  public setActiveTab(tab: SuperAdminDashboardTab): void {
    this.activeTab = tab;
  }

  public getTabLabel(tab: SuperAdminDashboardTab): string {
    if (tab === SuperAdminDashboardTab.Overview)
      return 'Visão geral';

    if (tab === SuperAdminDashboardTab.Charts)
      return 'Gráficos';

    if (tab === SuperAdminDashboardTab.Tables)
      return 'Tabelas';

    return 'Monitoramento';
  }

  public formatDate(value: string | null | undefined): string {
    return SuperAdminDashboardFormatUtil.formatDate(value);
  }

  public logout(): void {
    this.auth.logout();
  }

  public trackByTab(_: number, tab: SuperAdminDashboardTab): SuperAdminDashboardTab {
    return tab;
  }

  public trackByIndex(index: number): number {
    return index;
  }
}
