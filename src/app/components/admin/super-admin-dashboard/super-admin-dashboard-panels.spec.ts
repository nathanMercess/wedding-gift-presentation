import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY_DASHBOARD_RESPONSE } from '../../../constants/empty-dashboard-response.constant';
import { DashboardResponse } from '../../../models/dashboard-response.model';
import { SuperAdminActionCenterComponent } from './super-admin-action-center/super-admin-action-center.component';
import { SuperAdminActivityFeedComponent } from './super-admin-activity-feed/super-admin-activity-feed.component';
import { SuperAdminApiHealthComponent } from './super-admin-api-health/super-admin-api-health.component';
import { SuperAdminGiftInsightsComponent } from './super-admin-gift-insights/super-admin-gift-insights.component';
import { SuperAdminPaymentHealthComponent } from './super-admin-payment-health/super-admin-payment-health.component';
import { SuperAdminRevenuePanelComponent } from './super-admin-revenue-panel/super-admin-revenue-panel.component';

function createDashboard(): DashboardResponse {
  return JSON.parse(JSON.stringify(EMPTY_DASHBOARD_RESPONSE)) as DashboardResponse;
}

async function renderComponent<T>(component: Type<T>, dashboard: DashboardResponse): Promise<ComponentFixture<T>> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({ imports: [component] }).compileComponents();

  const fixture: ComponentFixture<T> = TestBed.createComponent(component);
  fixture.componentRef.setInput('dashboard', dashboard);
  fixture.detectChanges();

  return fixture;
}

describe('SuperAdmin dashboard panels', (): void => {
  it('SuperAdminActionCenterComponent_WhenHasActionItems_RendersPriorityItems', async (): Promise<void> => {
    const dashboard: DashboardResponse = createDashboard();
    dashboard.actionCenter = {
      healthStatus: 'critical',
      criticalCount: 1,
      warningCount: 0,
      items: [
        {
          severity: 'critical',
          title: 'Pagamentos aprovados sem contribuicao',
          description: 'Existe pagamento aprovado sem contribuicao criada.',
          metric: '1 pagamento',
          actionLabel: 'Reprocessar',
          category: 'payments',
          createdAtUtc: '2026-07-10T10:00:00Z',
        },
      ],
    };

    const fixture: ComponentFixture<SuperAdminActionCenterComponent> = await renderComponent(SuperAdminActionCenterComponent, dashboard);
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Action Center');
    expect(text).toContain('Pagamentos aprovados sem contribuicao');
    expect(text).toContain('1 pagamento');
    expect(fixture.componentInstance.trackByActionItem(0, dashboard.actionCenter.items[0])).toBe('payments-Pagamentos aprovados sem contribuicao-1 pagamento');
  });

  it('SuperAdminActivityFeedComponent_WhenDescriptionHasSensitiveText_HidesOperationalText', async (): Promise<void> => {
    const dashboard: DashboardResponse = createDashboard();
    dashboard.activityFeed = [
      {
        type: 'api',
        severity: 'warning',
        title: 'Falha operacional',
        description: 'Authorization token exposto no erro',
        amount: 25,
        status: 'pending',
        correlationId: 'corr-1',
        occurredAtUtc: '2026-07-10T10:00:00Z',
      },
    ];

    const fixture: ComponentFixture<SuperAdminActivityFeedComponent> = await renderComponent(SuperAdminActivityFeedComponent, dashboard);
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Falha operacional');
    expect(text).toContain('Conteúdo ocultado');
    expect(text).not.toContain('Authorization token exposto no erro');
    expect(fixture.componentInstance.trackByActivity(0, dashboard.activityFeed[0])).toBe('api-2026-07-10T10:00:00Z-Falha operacional-corr-1');
  });

  it('SuperAdminApiHealthComponent_WhenEndpointsHaveQueries_DisplaysCleanPaths', async (): Promise<void> => {
    const dashboard: DashboardResponse = createDashboard();
    dashboard.apiHealth = {
      successRate: 97,
      serverErrors: 1,
      clientErrors: 2,
      slowRequests: 3,
      averageDurationMilliseconds: 120,
      p95DurationMilliseconds: 450,
      lastServerErrorAtUtc: '2026-07-10T10:00:00Z',
      topErrorEndpoints: [
        {
          method: 'POST',
          path: '/api/payment/status?token=hidden',
          count: 3,
          serverErrors: 1,
          clientErrors: 2,
          slowRequests: 0,
          averageDurationMilliseconds: 120,
          p95DurationMilliseconds: 450,
          maxDurationMilliseconds: 600,
        },
      ],
      slowestEndpoints: [],
    };

    const fixture: ComponentFixture<SuperAdminApiHealthComponent> = await renderComponent(SuperAdminApiHealthComponent, dashboard);
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('/api/payment/status');
    expect(text).not.toContain('token=hidden');
    expect(fixture.componentInstance.displayPath('/api/test?x=1')).toBe('/api/test');
    expect(fixture.componentInstance.trackByEndpoint(0, dashboard.apiHealth.topErrorEndpoints[0])).toBe('POST-/api/payment/status?token=hidden');
  });

  it('SuperAdminGiftInsightsComponent_WhenGiftNeedsAttention_RendersOperationalGiftLists', async (): Promise<void> => {
    const dashboard: DashboardResponse = createDashboard();
    dashboard.giftInsights = {
      total: 3,
      fullyFunded: 1,
      available: 2,
      fullyFundedButAvailable: 1,
      withoutContributions: 1,
      overfunded: 0,
      topRemainingGifts: [
        {
          giftId: 'gift-1',
          giftName: 'Geladeira',
          category: 'Cozinha',
          total: 3000,
          raised: 500,
          remaining: 2500,
          fundingPercent: 16.67,
          paidContributions: 1,
          available: true,
          fullyFunded: false,
        },
      ],
      topRaisedGifts: [],
      stalledGifts: [],
    };

    const fixture: ComponentFixture<SuperAdminGiftInsightsComponent> = await renderComponent(SuperAdminGiftInsightsComponent, dashboard);
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Geladeira');
    expect(text).toContain('Cozinha');
    expect(fixture.componentInstance.trackByGift(0, dashboard.giftInsights.topRemainingGifts[0])).toBe('gift-1');
  });

  it('SuperAdminPaymentHealthComponent_WhenPaymentsHaveStatuses_ComputesFunnelMaximum', async (): Promise<void> => {
    const dashboard: DashboardResponse = createDashboard();
    dashboard.paymentHealth = {
      approvalRate: 80,
      failureRate: 20,
      pendingCount: 2,
      pendingAmount: 150,
      pendingOlderThan30Minutes: 1,
      approvedWithoutContribution: 0,
      failedLast24Hours: 1,
      topFailureReasons: [{ statusDetail: 'cc_rejected', count: 1 }],
      lastFailureAtUtc: '2026-07-10T10:00:00Z',
    };
    dashboard.paymentsByStatus = [
      { status: 'approved', count: 8, amount: 800 },
      { status: 'rejected', count: 2, amount: 200 },
    ];

    const fixture: ComponentFixture<SuperAdminPaymentHealthComponent> = await renderComponent(SuperAdminPaymentHealthComponent, dashboard);
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('approved');
    expect(text).toContain('cc_rejected');
    expect(fixture.componentInstance.maxPaymentStatusCount()).toBe(8);
    expect(fixture.componentInstance.trackByPaymentStatus(0, dashboard.paymentsByStatus[0])).toBe('approved');
  });

  it('SuperAdminRevenuePanelComponent_WhenHasDailyContributions_BuildsChartPoints', async (): Promise<void> => {
    const dashboard: DashboardResponse = createDashboard();
    dashboard.period = {
      fromUtc: '2026-07-08T00:00:00Z',
      toUtc: '2026-07-10T23:59:59Z',
      days: 3,
    };
    dashboard.revenue = {
      totalRaised: 1000,
      periodRaised: 450,
      remainingAmount: 2000,
      averageTicket: 150,
      largestContribution: 250,
      periodPaidCount: 3,
      fundingPercent: 33.33,
      dailyAverage: 150,
      bestDayAmount: 250,
      bestDayUtc: '2026-07-10T00:00:00Z',
    };
    dashboard.contributionsByDay = [
      { dateUtc: '2026-07-08T00:00:00Z', count: 1, amount: 100 },
      { dateUtc: '2026-07-09T00:00:00Z', count: 1, amount: 100 },
      { dateUtc: '2026-07-10T00:00:00Z', count: 1, amount: 250 },
    ];

    const fixture: ComponentFixture<SuperAdminRevenuePanelComponent> = await renderComponent(SuperAdminRevenuePanelComponent, dashboard);
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Receita e progresso');
    expect(fixture.componentInstance.maxContributionChartValue()).toBe(250);
    expect(fixture.componentInstance.contributionsLinePoints()).toContain('100.00,12.00');
    expect(fixture.componentInstance.trackByDay(0, dashboard.contributionsByDay[0])).toBe('2026-07-08T00:00:00Z');
  });
});
