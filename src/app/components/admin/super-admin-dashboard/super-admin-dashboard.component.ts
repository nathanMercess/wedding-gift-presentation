import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardContributionByDay, DashboardGiftByCategory, DashboardPaymentByMethod, DashboardPaymentByStatus, DashboardRecentContribution, DashboardRecentMessage, DashboardRecentPayment, DashboardRecentRequest, DashboardRequestByPath, DashboardRequestByStatus, DashboardResponse, DashboardTopGiftByRaised } from '../../../models/dashboard-response.model';
import { AuthService } from '../../../services/auth.service';
import { SuperAdminDashboardService } from '../../../services/super-admin-dashboard.service';

@Component({
  standalone: true,
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss',
  imports: [CommonModule, FormsModule, RouterLink],
})
export class SuperAdminDashboardComponent implements OnInit {
  public readonly dayOptions: number[] = [7, 15, 30, 60, 90];
  public readonly recentItemsOptions: number[] = [5, 10, 20, 50];
  public readonly slowRequestThresholdMilliseconds: number = 1000;
  public readonly sensitiveTerms: string[] = ['authorization', 'bearer', 'cookie', 'cookies', 'password', 'senha', 'token'];
  public readonly moneyFormatter: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  public readonly numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  public readonly percentFormatter: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  public readonly dateTimeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  public readonly dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

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

  public logout(): void {
    this.auth.logout();
  }

  public formatMoney(value: number): string {
    return this.moneyFormatter.format(value);
  }

  public formatNumber(value: number): string {
    return this.numberFormatter.format(value);
  }

  public formatPercent(value: number): string {
    return `${this.percentFormatter.format(value)}%`;
  }

  public formatDate(value: string | null | undefined): string {
    if (!value)
      return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
      return '-';

    return this.dateTimeFormatter.format(date);
  }

  public formatShortDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
      return '-';

    return this.dateFormatter.format(date);
  }

  public formatMilliseconds(value: number): string {
    return `${this.formatNumber(value)} ms`;
  }

  public formatBoolean(value: boolean): string {
    if (value)
      return 'Sim';

    return 'Não';
  }

  public displayValue(value: string | null | undefined): string {
    if (!value || value.trim().length === 0)
      return '-';

    return value;
  }

  public displayPath(path: string): string {
    const value: string = this.displayValue(path);

    if (value === '-')
      return value;

    const cleanPath: string = value.split('?')[0];

    if (!cleanPath)
      return '-';

    return cleanPath;
  }

  public safeOperationalText(value: string | null | undefined): string {
    const text: string = this.displayValue(value);

    if (text === '-')
      return text;

    const normalizedText: string = text.toLowerCase();
    const hasSensitiveTerm: boolean = this.sensitiveTerms.some((term: string): boolean => normalizedText.includes(term));

    if (hasSensitiveTerm)
      return 'Conteúdo ocultado';

    return text;
  }

  public progressPercent(value: number): number {
    if (!Number.isFinite(value))
      return 0;

    return Math.max(0, Math.min(value, 100));
  }

  public barWidth(value: number, maxValue: number): number {
    if (value <= 0 || maxValue <= 0)
      return 0;

    return Math.max(4, Math.min(100, (value / maxValue) * 100));
  }

  public max(values: number[]): number {
    if (values.length === 0)
      return 0;

    return Math.max(...values);
  }

  public maxContributionChartValue(data: DashboardResponse): number {
    return this.max(data.contributionsByDay.map((item: DashboardContributionByDay): number => this.contributionChartValue(item)));
  }

  public maxPaymentStatusCount(data: DashboardResponse): number {
    return this.max(data.paymentsByStatus.map((item: DashboardPaymentByStatus): number => item.count));
  }

  public maxPaymentMethodCount(data: DashboardResponse): number {
    return this.max(data.paymentsByMethod.map((item: DashboardPaymentByMethod): number => item.count));
  }

  public maxGiftCategoryAmount(data: DashboardResponse): number {
    return this.max(data.giftsByCategory.map((item: DashboardGiftByCategory): number => Math.max(item.goalAmount, item.raisedAmount)));
  }

  public maxRequestStatusCount(data: DashboardResponse): number {
    return this.max(data.requestsByStatus.map((item: DashboardRequestByStatus): number => item.count));
  }

  public maxRequestPathCount(data: DashboardResponse): number {
    return this.max(data.requestsByPath.map((item: DashboardRequestByPath): number => item.count));
  }

  public contributionChartValue(item: DashboardContributionByDay): number {
    if (item.amount > 0)
      return item.amount;

    return item.count;
  }

  public contributionsLinePoints(data: DashboardResponse): string {
    const items: DashboardContributionByDay[] = data.contributionsByDay;

    if (items.length === 0)
      return '';

    const maxValue: number = this.maxContributionChartValue(data);

    if (maxValue <= 0)
      return '';

    return items.map((item: DashboardContributionByDay, index: number): string => {
      const x: number = items.length === 1 ? 50 : (index / (items.length - 1)) * 100;
      const y: number = 88 - (this.contributionChartValue(item) / maxValue) * 76;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }

  public contributionsAreaPoints(data: DashboardResponse): string {
    const points: string = this.contributionsLinePoints(data);

    if (!points)
      return '';

    return `0,100 ${points} 100,100`;
  }

  public statusBadgeClass(status: string): string {
    const normalizedStatus: string = status.toLowerCase();

    if (normalizedStatus.includes('approved') || normalizedStatus.includes('paid') || normalizedStatus.includes('success') || normalizedStatus.includes('aprovado') || normalizedStatus.includes('pago'))
      return 'status-badge is-success';

    if (normalizedStatus.includes('pending') || normalizedStatus.includes('processing') || normalizedStatus.includes('pendente'))
      return 'status-badge is-warning';

    if (normalizedStatus.includes('failed') || normalizedStatus.includes('cancelled') || normalizedStatus.includes('canceled') || normalizedStatus.includes('rejected') || normalizedStatus.includes('error') || normalizedStatus.includes('falha') || normalizedStatus.includes('cancelado'))
      return 'status-badge is-danger';

    return 'status-badge';
  }

  public statusCodeBadgeClass(statusCode: number): string {
    if (statusCode >= 500)
      return 'status-badge is-danger';

    if (statusCode >= 400)
      return 'status-badge is-warning';

    if (statusCode >= 200 && statusCode < 300)
      return 'status-badge is-success';

    return 'status-badge';
  }

  public statusGroupBadgeClass(statusGroup: string): string {
    if (statusGroup.startsWith('5'))
      return 'status-badge is-danger';

    if (statusGroup.startsWith('4'))
      return 'status-badge is-warning';

    if (statusGroup.startsWith('2'))
      return 'status-badge is-success';

    return 'status-badge';
  }

  public isSlowRequest(durationMilliseconds: number): boolean {
    return durationMilliseconds > this.slowRequestThresholdMilliseconds;
  }

  public trackByPaymentStatus(_: number, item: DashboardPaymentByStatus): string {
    return item.status;
  }

  public trackByPaymentMethod(_: number, item: DashboardPaymentByMethod): string {
    return item.method;
  }

  public trackByGiftCategory(_: number, item: DashboardGiftByCategory): string {
    return item.category;
  }

  public trackByRequestStatus(_: number, item: DashboardRequestByStatus): string {
    return item.statusGroup;
  }

  public trackByRequestPath(_: number, item: DashboardRequestByPath): string {
    return `${item.method}-${item.path}`;
  }

  public trackByTopGift(_: number, item: DashboardTopGiftByRaised): string {
    return item.giftId;
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

  public trackByIndex(index: number): number {
    return index;
  }
}
