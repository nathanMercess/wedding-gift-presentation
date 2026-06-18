import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { EndpointsUrls } from '../../constants/api-endpoints';
import { CardPaymentDto } from '../models/card-payment-dto.model';
import { PixPaymentDto } from '../models/pix-payment-dto.model';

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
    expect(service.paymentState()).toEqual({ submitting: false, response: null, error: '' });
  });

  describe('payWithCard', () => {
    it('liga submitting e guarda a resposta no sucesso', () => {
      service.payWithCard(cardDto);
      expect(service.paymentState().submitting).toBe(true);

      const req = http.expectOne(endpoints.paymentCard);
      expect(req.request.method).toBe('POST');
      req.flush({ status: 'approved' });

      expect(service.paymentState().submitting).toBe(false);
      expect(service.paymentState().response).toBeTruthy();
      expect(service.paymentState().error).toBe('');
    });

    it('queda de rede (status 0) → mensagem amigável de conexão e submitting liberado', () => {
      service.payWithCard(cardDto);
      const req = http.expectOne(endpoints.paymentCard);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      expect(service.paymentState().submitting).toBe(false);
      expect(service.paymentState().error).toContain('Sem conexão');
      expect(service.paymentState().response).toBeNull();
    });

    it('erro do servidor (500 com detail) → expõe o detail sem estourar', () => {
      service.payWithCard(cardDto);
      const req = http.expectOne(endpoints.paymentCard);
      req.flush({ detail: 'Cartão recusado pela operadora' }, { status: 500, statusText: 'Server Error' });

      expect(service.paymentState().error).toBe('Cartão recusado pela operadora');
      expect(service.paymentState().submitting).toBe(false);
    });
  });

  describe('payWithPix', () => {
    it('guarda a resposta no sucesso', () => {
      service.payWithPix(pixDto);
      const req = http.expectOne(endpoints.paymentPix);
      expect(req.request.method).toBe('POST');
      req.flush({ mpOrderId: 'mp1', qrCodeBase64: 'abc' });

      expect(service.paymentState().response).toBeTruthy();
      expect(service.paymentState().submitting).toBe(false);
    });

    it('queda de rede → mensagem de conexão', () => {
      service.payWithPix(pixDto);
      const req = http.expectOne(endpoints.paymentPix);
      req.error(new ProgressEvent('error'), { status: 0 });

      expect(service.paymentState().error).toContain('Sem conexão');
    });
  });

  describe('checkStatus (polling)', () => {
    it('guarda a resposta de status no sucesso', () => {
      service.checkStatus('mp1');
      const req = http.expectOne(endpoints.paymentStatus('mp1'));
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'approved' });

      expect(service.statusState().response).toBeTruthy();
      expect(service.statusState().error).toBe('');
    });

    it('erro de rede no polling não estoura e registra error', () => {
      service.checkStatus('mp1');
      const req = http.expectOne(endpoints.paymentStatus('mp1'));
      req.error(new ProgressEvent('error'), { status: 0 });

      expect(service.statusState().error).toContain('Sem conexão');
    });
  });
});
