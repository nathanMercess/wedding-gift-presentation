import { AdminContribution } from './admin-contribution.model';
import { AdminPayment } from './admin-payment.model';
import { AdminUser } from './admin-user.model';
import { CoupleOverview } from './couple-overview.model';

export interface AdminOperationsState {
  overview: CoupleOverview | null;
  contributions: AdminContribution[];
  contributionTotal: number;
  contributionPages: number;
  payments: AdminPayment[];
  paymentTotal: number;
  paymentPages: number;
  users: AdminUser[];
  userTotal: number;
  userPages: number;
  loading: boolean;
  actionLoading: boolean;
  error: string;
}
