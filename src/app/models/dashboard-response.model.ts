export interface DashboardPeriod {
  fromUtc: string;
  toUtc: string;
  days: number;
}

export interface DashboardOverview {
  totalRaised: number;
  totalGoal: number;
  fundingPercent: number;
  totalGifts: number;
  fullyFundedGifts: number;
  paidContributions: number;
  uniqueContributors: number;
  approvedPayments: number;
  failedPayments: number;
}

export interface DashboardGifts {
  total: number;
  available: number;
  unavailable: number;
  fullyFunded: number;
  partiallyFunded: number;
  withoutContributions: number;
  goalAmount: number;
  raisedAmount: number;
  remainingAmount: number;
  averageFundingPercent: number;
}

export interface DashboardContributions {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
  paidAmount: number;
  pendingAmount: number;
  cancelledAmount: number;
  averagePaidAmount: number;
  uniqueContributors: number;
  messagesCount: number;
  periodPaidCount: number;
  periodPaidAmount: number;
}

export interface DashboardPayments {
  total: number;
  approved: number;
  pending: number;
  failed: number;
  other: number;
  pix: number;
  card: number;
  approvedWithoutContribution: number;
  approvedAmount: number;
  pendingAmount: number;
  failedAmount: number;
  successRate: number;
  failureRate: number;
}

export interface DashboardMessages {
  total: number;
  contributionMessages: number;
  paymentIntentMessages: number;
  latestMessageAtUtc: string | null;
}

export interface DashboardRequests {
  total: number;
  successful: number;
  clientErrors: number;
  serverErrors: number;
  authenticated: number;
  anonymous: number;
  slowRequests: number;
  successRate: number;
  clientErrorRate: number;
  serverErrorRate: number;
  averageDurationMilliseconds: number;
  maxDurationMilliseconds: number;
  lastRequestAtUtc: string | null;
}

export interface DashboardMonitoring {
  databaseStatus: string;
  applicationLogsStatus: string;
  metricsStatus: string;
  pendingPayments: number;
  pendingPixPayments: number;
  failedPayments: number;
  approvedPaymentsWithoutContribution: number;
  serverErrorRequests: number;
  slowRequests: number;
  averageRequestDurationMilliseconds: number;
  lastPaymentAtUtc: string | null;
  lastContributionAtUtc: string | null;
  lastRequestAtUtc: string | null;
  notes: string[];
}

export interface DashboardActionCenter {
  healthStatus: string;
  criticalCount: number;
  warningCount: number;
  items: DashboardActionItem[];
}

export interface DashboardActionItem {
  severity: string;
  title: string;
  description: string;
  metric: string;
  actionLabel: string;
  category: string;
  createdAtUtc: string | null;
}

export interface DashboardRevenue {
  totalRaised: number;
  periodRaised: number;
  remainingAmount: number;
  averageTicket: number;
  largestContribution: number;
  periodPaidCount: number;
  fundingPercent: number;
  dailyAverage: number;
  bestDayAmount: number;
  bestDayUtc: string | null;
}

export interface DashboardPaymentHealth {
  approvalRate: number;
  failureRate: number;
  pendingCount: number;
  pendingAmount: number;
  pendingOlderThan30Minutes: number;
  approvedWithoutContribution: number;
  failedLast24Hours: number;
  topFailureReasons: DashboardPaymentFailureReason[];
  lastFailureAtUtc: string | null;
}

export interface DashboardPaymentFailureReason {
  statusDetail: string;
  count: number;
}

export interface DashboardGiftInsights {
  total: number;
  fullyFunded: number;
  available: number;
  fullyFundedButAvailable: number;
  withoutContributions: number;
  overfunded: number;
  topRemainingGifts: DashboardTopGiftByRaised[];
  topRaisedGifts: DashboardTopGiftByRaised[];
  stalledGifts: DashboardTopGiftByRaised[];
}

export interface DashboardApiHealth {
  successRate: number;
  serverErrors: number;
  clientErrors: number;
  slowRequests: number;
  averageDurationMilliseconds: number;
  p95DurationMilliseconds: number;
  slowestEndpoints: DashboardApiEndpointHealth[];
  topErrorEndpoints: DashboardApiEndpointHealth[];
  lastServerErrorAtUtc: string | null;
}

export interface DashboardApiEndpointHealth {
  method: string;
  path: string;
  count: number;
  serverErrors: number;
  clientErrors: number;
  slowRequests: number;
  averageDurationMilliseconds: number;
  p95DurationMilliseconds: number;
  maxDurationMilliseconds: number;
}

export interface DashboardContributionByDay {
  dateUtc: string;
  count: number;
  amount: number;
}

export interface DashboardPaymentByStatus {
  status: string;
  count: number;
  amount: number;
}

export interface DashboardPaymentByMethod {
  method: string;
  count: number;
  amount: number;
}

export interface DashboardGiftByCategory {
  category: string;
  count: number;
  goalAmount: number;
  raisedAmount: number;
}

export interface DashboardRequestByStatus {
  statusGroup: string;
  count: number;
  averageDurationMilliseconds: number;
}

export interface DashboardRequestByPath {
  method: string;
  path: string;
  count: number;
  serverErrors: number;
  averageDurationMilliseconds: number;
  maxDurationMilliseconds: number;
}

export interface DashboardTopGiftByRaised {
  giftId: string;
  giftName: string;
  category: string;
  total: number;
  raised: number;
  remaining: number;
  fundingPercent: number;
  paidContributions: number;
  available: boolean;
  fullyFunded: boolean;
}

export interface DashboardRecentMessage {
  source: string;
  sourceId: string;
  giftId: string;
  giftName: string;
  contributorName: string;
  message: string;
  amount: number;
  status: string;
  createdAtUtc: string;
}

export interface DashboardRecentRequest {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  isSuccess: boolean;
  isAuthenticated: boolean;
  userRole: string;
  durationMilliseconds: number;
  correlationId: string;
  exceptionType: string;
  exceptionMessage: string;
  startedAtUtc: string;
}

export interface DashboardRecentPayment {
  id: string;
  giftId: string;
  giftName: string;
  contributorName: string;
  method: string;
  amount: number;
  installments: number;
  status: string;
  statusDetail: string;
  orderId: string;
  mpOrderId: string;
  mpPaymentId: string;
  contributionCreated: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface DashboardRecentContribution {
  id: string;
  giftId: string;
  giftName: string;
  contributorName: string;
  message: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAtUtc: string;
}

export interface DashboardActivityFeedItem {
  type: string;
  severity: string;
  title: string;
  description: string;
  amount: number | null;
  status: string | null;
  correlationId: string | null;
  occurredAtUtc: string;
}

export interface DashboardOverviewResponse {
  generatedAtUtc: string;
  period: DashboardPeriod;
  overview: DashboardOverview;
  gifts: DashboardGifts;
  contributions: DashboardContributions;
  payments: DashboardPayments;
  messages: DashboardMessages;
  requests: DashboardRequests;
  monitoring: DashboardMonitoring;
}

export interface DashboardCharts {
  contributionsByDay: DashboardContributionByDay[];
  paymentsByStatus: DashboardPaymentByStatus[];
  paymentsByMethod: DashboardPaymentByMethod[];
  giftsByCategory: DashboardGiftByCategory[];
  requestsByStatus: DashboardRequestByStatus[];
  requestsByPath: DashboardRequestByPath[];
}

export interface DashboardResponse {
  generatedAtUtc: string;
  period: DashboardPeriod;
  overview: DashboardOverview;
  gifts: DashboardGifts;
  contributions: DashboardContributions;
  payments: DashboardPayments;
  messages: DashboardMessages;
  requests: DashboardRequests;
  monitoring: DashboardMonitoring;
  actionCenter: DashboardActionCenter;
  revenue: DashboardRevenue;
  paymentHealth: DashboardPaymentHealth;
  giftInsights: DashboardGiftInsights;
  apiHealth: DashboardApiHealth;
  contributionsByDay: DashboardContributionByDay[];
  paymentsByStatus: DashboardPaymentByStatus[];
  paymentsByMethod: DashboardPaymentByMethod[];
  giftsByCategory: DashboardGiftByCategory[];
  requestsByStatus: DashboardRequestByStatus[];
  requestsByPath: DashboardRequestByPath[];
  topGiftsByRaised: DashboardTopGiftByRaised[];
  recentMessages: DashboardRecentMessage[];
  recentRequests: DashboardRecentRequest[];
  recentPayments: DashboardRecentPayment[];
  recentFailedPayments: DashboardRecentPayment[];
  recentContributions: DashboardRecentContribution[];
  activityFeed: DashboardActivityFeedItem[];
}
