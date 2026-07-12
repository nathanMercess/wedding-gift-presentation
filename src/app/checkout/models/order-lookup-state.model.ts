import { OrderLookupResponse } from './order-lookup-response.model';

export interface OrderLookupState {
  loading: boolean;
  requested: boolean;
  hasResponse: boolean;
  response: OrderLookupResponse | null;
  error: string;
}
