import { Gift } from './gift.model';

export interface GuestGiftState {
  gifts: Gift[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string;
  overallTotal: number;
  overallCompleted: number;
  overallRaised: number;
  overallGoal: number;
}
