import { OrderLookupStatus } from '../enums/order-lookup-status.enum';

export interface OrderLookupResponse {
  orderId: string;
  giftName: string;
  giftImage: string;
  amount: number;
  method: string;
  status: OrderLookupStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
  contributionCreated: boolean;
}
