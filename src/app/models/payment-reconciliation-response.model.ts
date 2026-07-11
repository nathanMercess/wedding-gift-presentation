export interface PaymentReconciliationItem {
  mpOrderId: string;
  orderId: string;
  method: string;
  status: string;
  contributionCreated: boolean;
  result: string;
}

export interface PaymentReconciliationResponse {
  checkedCount: number;
  createdCount: number;
  skippedCount: number;
  failedCount: number;
  items: PaymentReconciliationItem[];
}
