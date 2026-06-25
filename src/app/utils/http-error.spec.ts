import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { HttpErrorUtil } from './http-error';

function err(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

function apiError(code: string, fields: Record<string, string[]> | null = null, correlationId: string = '0HN'): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: { code, fields, details: null },
    correlationId,
  };
}

describe('HttpErrorUtil.extract', () => {
  it('status 0 retorna mensagem de conexao', () => {
    expect(HttpErrorUtil.extract(err(0, null), 'fallback')).toContain('Sem conexao');
  });

  it('VALIDATION_ERROR traduz codigos de campo', () => {
    const body: ApiResponse<null> = apiError('VALIDATION_ERROR', { email: ['FIELD_INVALID'], name: ['FIELD_INVALID'] });
    expect(HttpErrorUtil.extract(err(400, body), 'fallback')).toBe('email: Campo invalido. name: Campo invalido. Codigo de suporte: 0HN.');
  });

  it('traduz error.code como fonte principal', () => {
    expect(HttpErrorUtil.extract(err(409, apiError('GIFT_UNAVAILABLE')), 'fallback')).toBe('Este presente nao esta disponivel. Codigo de suporte: 0HN.');
  });

  it('UNAUTHORIZED por code equivale a 401', () => {
    expect(HttpErrorUtil.isUnauthorized(err(200, apiError('UNAUTHORIZED')))).toBe(true);
  });

  it('FORBIDDEN por code equivale a 403', () => {
    expect(HttpErrorUtil.isForbidden(err(200, apiError('FORBIDDEN')))).toBe(true);
  });

  it('sem envelope retorna fallback com status', () => {
    expect(HttpErrorUtil.extract(err(503, null), 'Erro')).toBe('Erro (503)');
  });
});
