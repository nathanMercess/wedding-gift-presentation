import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { EndpointsUrls } from '../../constants/api-endpoints';
import { ApiResponse } from '../../models/api-response.model';
import { CardPaymentDto } from '../models/card-payment-dto.model';
import { EMPTY_PAYMENT_RESPONSE } from '../constants/empty-payment-response.constant';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentResponse } from '../models/payment-response.model';
import { PixPaymentDto } from '../models/pix-payment-dto.model';

abstract class PaymentServiceTestData {
  public static apiSuccess<T>(data: T): ApiResponse<T> {
    return { success: true, data, error: null, correlationId: '0HN' };
  }

  public static apiError(code: string): ApiResponse<null> {
    return { success: false, data: null, error: { code, fields: null, details: null }, correlationId: '0HN' };
  }
}

describe('PaymentService — resiliência de rede', () => {
  let service: PaymentService;
  let http: HttpTestingController;
  let endpoints: EndpointsUrls;

  const cardDto = {} as unknown as CardPaymentDto;
  const pixDto = {} as unknown as PixPaymentDto;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService, EndpointsUrls],
    });
    service = TestBed.inject(PaymentService);
    http = TestBed.inject(HttpTestingController);
    endpoints = TestBed.inject(EndpointsUrls);
  });

  afterEach(() => http.verify());

  it('estado inicial limpo', () => {
    expect(service.paymentState()).toEqual({ submitting: false, hasResponse: false, response: EMPTY_PAYMENT_RESPONSE, error: '', uncertainFailure: false });
  });

  describe('payWithCard', () => {
    it('liga submitting e guarda a resposta no sucesso', () => {
      service.payWithCard(cardDto);
      expect(service.paymentState().submitting).toBe(true);

      const req = http.expectOne(endpoints.paymentCard);
      expect(req.request.method).toBe('POST');
      req.flush(PaymentServiceTestData.apiSuccess({ status: 'approved' } as PaymentResponse));

      expect(service.paymentState().submitting).toBe(false);
      expect(service.paymentState().hasResponse).toBe(true);
      expect(service.paymentState().response).toBeTruthy();
      expect(service.paymentState().error).toBe('');
    });

    it('queda de rede (status 0) → mensagem amigável de conexão e submitting liberado', () => {
      service.payWithCard(cardDto);
      const req = http.expectOne(endpoints.paymentCard);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      expect(service.paymentState().submitting).toBe(false);
      expect(service.paymentState().error).toContain('Sem conexao');
      expect(service.paymentState().uncertainFailure).toBe(true);
      expect(service.paymentState().hasResponse).toBe(false);
      expect(service.paymentState().response).toEqual(EMPTY_PAYMENT_RESPONSE);
    });

    it('erro do servidor com error.code traduz localmente', () => {
      service.payWithCard(cardDto);
      const req = http.expectOne(endpoints.paymentCard);
      req.flush(PaymentServiceTestData.apiError('PAYMENT_DECLINED'), { status: 402, statusText: 'Payment Required' });

      expect(service.paymentState().error).toContain('Pagamento recusado');
      expect(service.paymentState().uncertainFailure).toBe(false);
      expect(service.paymentState().submitting).toBe(false);
    });

    it('classifica validação 422 como definitiva e indisponibilidade 503 como incerta', () => {
      service.payWithCard(cardDto);
      http.expectOne(endpoints.paymentCard).flush(PaymentServiceTestData.apiError('INVALID_CARD_TOKEN'), { status: 422, statusText: 'Unprocessable Entity' });
      expect(service.paymentState().uncertainFailure).toBe(false);

      service.payWithCard(cardDto);
      http.expectOne(endpoints.paymentCard).flush(PaymentServiceTestData.apiError('PROVIDER_ERROR'), { status: 503, statusText: 'Service Unavailable' });
      expect(service.paymentState().uncertainFailure).toBe(true);
    });
  });

  describe('payWithPix', () => {
    it('guarda a resposta no sucesso', () => {
      service.payWithPix(pixDto);
      const req = http.expectOne(endpoints.paymentPix);
      expect(req.request.method).toBe('POST');
      req.flush(PaymentServiceTestData.apiSuccess({ status: 'pending', mpOrderId: 'mp1', qrCodeBase64: 'abc' } as PaymentResponse));

      expect(service.paymentState().response).toBeTruthy();
      expect(service.paymentState().hasResponse).toBe(true);
      expect(service.paymentState().submitting).toBe(false);
    });

    it('queda de rede → mensagem de conexão', () => {
      service.payWithPix(pixDto);
      const req = http.expectOne(endpoints.paymentPix);
      req.error(new ProgressEvent('error'), { status: 0 });

      expect(service.paymentState().error).toContain('Sem conexao');
    });
  });

  describe('loadOrder (polling seguro por orderId)', () => {
    it('guarda a resposta de status no sucesso', () => {
      service.loadOrder('order-1');
      const req = http.expectOne(endpoints.paymentOrder('order-1'));
      expect(req.request.method).toBe('GET');
      req.flush(PaymentServiceTestData.apiSuccess({ status: 'approved' } as PaymentResponse));

      expect(service.statusState().response).toBeTruthy();
      expect(service.statusState().hasResponse).toBe(true);
      expect(service.statusState().error).toBe('');
      expect(service.statusState().orderId).toBe('order-1');
    });

    it('identifica cada resposta quando consultas concorrentes terminam fora de ordem', () => {
      service.loadOrder('order-a');
      const requestA = http.expectOne(endpoints.paymentOrder('order-a'));
      service.loadOrder('order-b');
      const requestB = http.expectOne(endpoints.paymentOrder('order-b'));

      requestA.flush(PaymentServiceTestData.apiSuccess({ status: PaymentStatus.Pending, orderId: 'order-a' } as PaymentResponse));
      expect(service.statusState().orderId).toBe('order-a');
      expect(service.statusState().response.orderId).toBe('order-a');

      requestB.flush(PaymentServiceTestData.apiSuccess({ status: PaymentStatus.Approved, orderId: 'order-b' } as PaymentResponse));
      expect(service.statusState().orderId).toBe('order-b');
      expect(service.statusState().response.orderId).toBe('order-b');
    });

    it('erro de rede no polling não estoura e registra error', () => {
      service.loadOrder('order-1');
      const req = http.expectOne(endpoints.paymentOrder('order-1'));
      req.error(new ProgressEvent('error'), { status: 0 });

      expect(service.statusState().error).toContain('Sem conexao');
      expect(service.statusState().orderId).toBe('order-1');
    });

    it('interrompe uma consulta que ultrapassa dez segundos', () => {
      jest.useFakeTimers();
      service.loadOrder('order-timeout');
      const req = http.expectOne(endpoints.paymentOrder('order-timeout'));

      jest.advanceTimersByTime(10001);

      expect(req.cancelled).toBe(true);
      expect(service.statusState().error).toContain('Sem conexao');
      jest.useRealTimers();
    });
  });
});
