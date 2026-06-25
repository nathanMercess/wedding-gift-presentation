import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiResponse } from '../models/api-response.model';
import { EndpointsUrls } from '../constants/api-endpoints';
import { AuthService } from '../services/auth.service';
import { AuthInterceptor } from './auth.interceptor';

function apiError(code: string): ApiResponse<null> {
  return { success: false, data: null, error: { code, fields: null, details: null }, correlationId: '0HN' };
}

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

  it('anexa Bearer em requisicoes admin quando ha token', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get(endpoints.adminGiftsList).subscribe();

    const req = httpMock.expectOne(endpoints.adminGiftsList);
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok123');
    req.flush({});
  });

  it('nao anexa token em rotas publicas da API', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get(endpoints.giftsList).subscribe();

    const req = httpMock.expectOne(endpoints.giftsList);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('nao anexa token em hosts fora da API', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get('https://storage.googleapis.com/weddinggift-uploads/x.jpg').subscribe();

    const req = httpMock.expectOne('https://storage.googleapis.com/weddinggift-uploads/x.jpg');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('nao anexa token na rota de login', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.post(endpoints.authLogin, {}).subscribe();

    const req = httpMock.expectOne(endpoints.authLogin);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('sem token, segue requisicao admin sem Authorization', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue(null);

    http.get(endpoints.adminGiftsList).subscribe();

    const req = httpMock.expectOne(endpoints.adminGiftsList);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('401 em requisicao admin autenticada dispara logout suave', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get(endpoints.adminGiftsList).subscribe({ error: (): void => {} });

    const req = httpMock.expectOne(endpoints.adminGiftsList);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('UNAUTHORIZED por error.code tambem dispara logout suave', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get(endpoints.adminGiftsList).subscribe({ error: (): void => {} });

    const req = httpMock.expectOne(endpoints.adminGiftsList);
    req.flush(apiError('UNAUTHORIZED'), { status: 400, statusText: 'Bad Request' });

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('erro nao autenticacao nao desloga o usuario', () => {
    jest.spyOn(auth, 'getToken').mockReturnValue('tok123');

    http.get(endpoints.adminGiftsList).subscribe({ error: (): void => {} });

    const req = httpMock.expectOne(endpoints.adminGiftsList);
    req.flush(apiError('UNHANDLED_ERROR'), { status: 500, statusText: 'Server Error' });

    expect(auth.logout).not.toHaveBeenCalled();
  });
});
