import { ContributionStatus } from '../enums/contribution-status.enum';

export interface AdminContribution {
  id: string;
  giftId: string;
  giftName?: string;
  contributorName: string;
  message: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  status: ContributionStatus;
  messageReadAtUtc?: string | null;
  messageArchivedAtUtc?: string | null;
}
