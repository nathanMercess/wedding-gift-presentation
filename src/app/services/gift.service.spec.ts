import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GiftService } from './gift.service';
import { EndpointsUrls } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { Gift } from '../models/gift.model';
import { PagedResult } from '../models/paged-result.model';

function makeGift(over: Partial<Gift> = {}): Gift {
  return {
    id: 'g1',
    image: 'http://img/g1.jpg',
    name: 'Jogo de panelas',
    price: 500,
    raised: 100,
    total: 500,
    fullyFunded: false,
    description: '',
    available: true,
    allowPartialContribution: true,
    ...over,
  };
}

function makePage(items: Gift[]): PagedResult<Gift> {
  return { items, totalCount: items.length, page: 1, pageSize: 20, totalPages: 1 };
}

function apiSuccess<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null, correlationId: '0HN' };
}

function apiError(code: string): ApiResponse<null> {
  return { success: false, data: null, error: { code, fields: null, details: null }, correlationId: '0HN' };
}

describe('GiftService', () => {
  let service: GiftService;
  let httpMock: HttpTestingController;
  let endpoints: EndpointsUrls;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GiftService, EndpointsUrls],
    });
    service = TestBed.inject(GiftService);
    httpMock = TestBed.inject(HttpTestingController);
    endpoints = TestBed.inject(EndpointsUrls);
  });

  afterEach(() => httpMock.verify());

  it('deve ser criado com estado inicial limpo', () => {
    expect(service).toBeTruthy();
    expect(service.adminState().gifts).toEqual([]);
    expect(service.adminState().giftsLoading).toBe(false);
  });

  describe('loadAdminGifts', () => {
    it('liga o loading, popula a lista no sucesso e desliga o loading', () => {
      service.loadAdminGifts({ page: 1 });
      expect(service.adminState().giftsLoading).toBe(true);

      const req = httpMock.expectOne((r) => r.url === endpoints.adminGiftsList);
      expect(req.request.method).toBe('GET');
      req.flush(apiSuccess(makePage([makeGift()])));

      expect(service.adminState().giftsLoading).toBe(false);
      expect(service.adminState().gifts.length).toBe(1);
      expect(service.adminState().giftsError).toBe('');
    });

    it('seta giftsError em falha de rede, sem deixar o loading preso', () => {
      service.loadAdminGifts();
      const req = httpMock.expectOne((r) => r.url === endpoints.adminGiftsList);
      req.flush(apiError('UNHANDLED_ERROR'), { status: 500, statusText: 'Server Error' });

      expect(service.adminState().giftsLoading).toBe(false);
      expect(service.adminState().giftsError).toBeTruthy();
    });
  });

  describe('saveAdminGift — edição otimista', () => {
    beforeEach(() => {
      service.patchAdminState({ gifts: [makeGift({ id: 'g1', name: 'Antigo' })], totalCount: 1 });
    });

    it('reflete a mudança IMEDIATAMENTE (otimista) e nunca recarrega a lista', () => {
      service.saveAdminGift('g1', { name: 'Novo nome' });

      expect(service.adminState().gifts[0].name).toBe('Novo nome');
      expect(service.adminState().giftSaving).toBe(true);

      const req = httpMock.expectOne(endpoints.adminGiftsById('g1'));
      expect(req.request.method).toBe('PUT');
      req.flush(apiSuccess(makeGift({ id: 'g1', name: 'Novo nome', raised: 200 })));

      expect(service.adminState().gifts[0].raised).toBe(200);
      expect(service.adminState().giftSaved).toBe(true);
      expect(service.adminState().giftSaving).toBe(false);
      httpMock.expectNone(endpoints.adminGiftsList);
    });

    it('faz ROLLBACK ao snapshot e expõe giftError quando a API falha', () => {
      service.saveAdminGift('g1', { name: 'Novo nome' });
      expect(service.adminState().gifts[0].name).toBe('Novo nome');

      const req = httpMock.expectOne(endpoints.adminGiftsById('g1'));
      req.flush(apiError('UNHANDLED_ERROR'), { status: 500, statusText: 'Server Error' });

      expect(service.adminState().gifts[0].name).toBe('Antigo');
      expect(service.adminState().giftError).toBeTruthy();
      expect(service.adminState().giftSaving).toBe(false);
    });
  });

  describe('saveAdminGift — criação', () => {
    it('insere o item retornado no topo e incrementa o total sem recarregar', () => {
      service.patchAdminState({ gifts: [makeGift({ id: 'g1' })], totalCount: 1 });
      service.saveAdminGift('', { name: 'Novo' });

      const req = httpMock.expectOne(endpoints.adminGiftsList);
      expect(req.request.method).toBe('POST');
      req.flush(apiSuccess(makeGift({ id: 'g2', name: 'Novo' })));

      expect(service.adminState().gifts[0].id).toBe('g2');
      expect(service.adminState().totalCount).toBe(2);
      expect(service.adminState().giftSaved).toBe(true);
      httpMock.expectNone((r) => r.method === 'GET' && r.url === endpoints.adminGiftsList);
    });
  });

  describe('deleteAdminGift — otimista', () => {
    beforeEach(() => {
      service.patchAdminState({ gifts: [makeGift({ id: 'g1' }), makeGift({ id: 'g2' })], totalCount: 2 });
    });

    it('remove imediatamente e não recarrega no sucesso', () => {
      service.deleteAdminGift('g1');

      expect(service.adminState().gifts.length).toBe(1);
      expect(service.adminState().gifts[0].id).toBe('g2');
      expect(service.adminState().totalCount).toBe(1);

      const req = httpMock.expectOne(endpoints.adminGiftsById('g1'));
      expect(req.request.method).toBe('DELETE');
      req.flush(apiSuccess(null));

      expect(service.adminState().gifts.length).toBe(1);
      httpMock.expectNone(endpoints.adminGiftsList);
    });

    it('restaura a lista (rollback) e expõe giftsError quando a remoção falha', () => {
      service.deleteAdminGift('g1');
      expect(service.adminState().gifts.length).toBe(1);

      const req = httpMock.expectOne(endpoints.adminGiftsById('g1'));
      req.flush(apiError('UNHANDLED_ERROR'), { status: 500, statusText: 'Server Error' });

      expect(service.adminState().gifts.length).toBe(2);
      expect(service.adminState().giftsError).toBeTruthy();
    });
  });

  describe('refreshAdminGiftsSilently — tempo real sem flicker', () => {
    it('atualiza a lista por baixo dos panos SEM ligar o giftsLoading', () => {
      service.patchAdminState({ gifts: [makeGift({ id: 'g1', available: true, raised: 0 })], totalCount: 1 });

      service.refreshAdminGiftsSilently({ page: 1, pageSize: 20 });
      expect(service.adminState().giftsLoading).toBe(false);

      const req = httpMock.expectOne((r) => r.url === endpoints.adminGiftsList);
      expect(req.request.method).toBe('GET');
      req.flush(apiSuccess(makePage([makeGift({ id: 'g1', available: false, raised: 500 })])));

      expect(service.adminState().giftsLoading).toBe(false);
      expect(service.adminState().gifts[0].available).toBe(false);
      expect(service.adminState().gifts[0].raised).toBe(500);
    });

    it('falha de rede no polling é silenciosa (não polui giftsError)', () => {
      service.refreshAdminGiftsSilently();

      const req = httpMock.expectOne((r) => r.url === endpoints.adminGiftsList);
      req.error(new ProgressEvent('error'), { status: 0 });

      expect(service.adminState().giftsError).toBe('');
      expect(service.adminState().giftsLoading).toBe(false);
    });
  });

  describe('refreshGuestGiftsSilently — sem flicker pós-pagamento', () => {
    it('atualiza a lista do convidado sem ligar o loading', () => {
      service.refreshGuestGiftsSilently({ page: 1, pageSize: 20 });
      expect(service.guestState().loading).toBe(false);

      const req = httpMock.expectOne((r) => r.url === endpoints.giftsList);
      expect(req.request.method).toBe('GET');
      req.flush(apiSuccess(makePage([makeGift({ id: 'g1', raised: 500, available: false })])));

      expect(service.guestState().loading).toBe(false);
      expect(service.guestState().gifts[0].available).toBe(false);
    });
  });
});
