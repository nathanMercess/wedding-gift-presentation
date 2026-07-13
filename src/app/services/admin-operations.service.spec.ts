import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PaymentStatus } from '../checkout/enums/payment-status.enum';
import { EndpointsUrls } from '../constants/api-endpoints';
import { AdminPayment } from '../models/admin-payment.model';
import { AdminOperationsService } from './admin-operations.service';

describe('AdminOperationsService', () => {
  let service: AdminOperationsService;
  let http: HttpTestingController;
  let endpoints: EndpointsUrls;

  beforeEach((): void => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [AdminOperationsService, EndpointsUrls] });
    service = TestBed.inject(AdminOperationsService);
    http = TestBed.inject(HttpTestingController);
    endpoints = TestBed.inject(EndpointsUrls);
  });

  afterEach((): void => http.verify());

  it('envia a chave de idempotência no estorno', () => {
    const payment: AdminPayment = { orderId: 'order-1', giftId: 'gift-1', giftName: 'Presente', amount: 100, contributorName: 'Convidado', method: 'credit_card', status: PaymentStatus.Approved, message: '', contributionCreated: true };
    let succeeded: boolean = false;

    service.refundPayment(payment, 'refund-key-1', (): void => { succeeded = true; });

    const request = http.expectOne(endpoints.adminPaymentRefund('order-1'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ idempotencyKey: 'refund-key-1' });
    service.patchState({ payments: [payment] });
    request.flush({ success: true, data: { orderId: payment.orderId, status: PaymentStatus.Refunded, refundedAmount: 100, remainingAmount: 0 }, error: null, correlationId: 'test' });

    expect(succeeded).toBe(true);
    expect(service.state().payments).toEqual([{ ...payment, status: PaymentStatus.Refunded, refundedAmount: 100, remainingAmount: 0 }]);
    expect(service.state().actionLoading).toBe(false);
  });
});
