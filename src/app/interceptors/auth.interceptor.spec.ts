import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { EndpointsUrls } from '../constants/api-endpoints';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let endpoints: EndpointsUrls;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        EndpointsUrls,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    endpoints = TestBed.inject(EndpointsUrls);
    jest.spyOn(auth, 'logout').mockImplementation((): void => {});
  });

  afterEach(() => {
    httpMock.verify();
    jest.restoreAllMocks();
  });

  it('anexa Bearer em requisições para a API quando há token', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get(endpoints.giftsList).subscribe();

    const req = httpMock.expectOne(endpoints.giftsList);
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok123');
    req.flush({});
  });

  it('NÃO anexa token em hosts fora da API (evita vazar o JWT para terceiros)', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get('https://storage.googleapis.com/weddinggift-uploads/x.jpg').subscribe();

    const req = httpMock.expectOne('https://storage.googleapis.com/weddinggift-uploads/x.jpg');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('NÃO anexa token na rota de login', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.post(endpoints.authLogin, {}).subscribe();

    const req = httpMock.expectOne(endpoints.authLogin);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('sem token, segue a requisição sem Authorization', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue(null);

    http.get(endpoints.giftsList).subscribe();

    const req = httpMock.expectOne(endpoints.giftsList);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('401 em requisição autenticada dispara logout suave', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get(endpoints.adminGiftsList).subscribe({ error: (): void => {} });

    const req = httpMock.expectOne(endpoints.adminGiftsList);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('erro não-401 não desloga o usuário', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get(endpoints.adminGiftsList).subscribe({ error: (): void => {} });

    const req = httpMock.expectOne(endpoints.adminGiftsList);
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(auth.logout).not.toHaveBeenCalled();
  });
});
