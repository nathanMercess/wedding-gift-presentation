export interface Contribution {
  id: number;
  giftId: number;
  guestName: string;
  amount: number;
  message?: string;
  createdAt?: string;
}

export interface ContributionRequest {
  guestName: string;
  amount: number;
  message?: string;
}
