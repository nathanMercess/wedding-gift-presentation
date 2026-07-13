export interface CoupleOverviewDailyAmount {
  dateUtc: string;
  amount: number;
}

export interface CoupleOverview {
  totalRaised: number;
  goal: number;
  totalGifts: number;
  completedGifts: number;
  giftsWithoutContribution: number;
  approvedContributions: number;
  pendingContributions: number;
  failedContributions: number;
  uniqueContributors: number;
  dailyApprovedAmounts: CoupleOverviewDailyAmount[];
}
