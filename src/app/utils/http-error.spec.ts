import { HttpErrorResponse } from '@angular/common/http';
import { HttpErrorUtil } from './http-error';

function err(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('HttpErrorUtil.extract', () => {
  it('status 0 → mensagem de conexão', () => {
    expect(HttpErrorUtil.extract(err(0, null), 'fallback')).toContain('Sem conexão');
  });

  it('ValidationProblemDetails (errors) → junta as mensagens de campo', () => {
    const body = { errors: { Email: ['E-mail inválido.'], Nome: ['Obrigatório.'] } };
    expect(HttpErrorUtil.extract(err(400, body), 'fallback')).toBe('E-mail inválido. Obrigatório.');
  });

  it('ProblemDetails: detail tem precedência sobre title', () => {
    expect(HttpErrorUtil.extract(err(500, { detail: 'Detalhe', title: 'Título' }), 'fallback')).toBe('Detalhe');
  });

  it('PaymentResponseDto { message } é exposto (alinhado ao backend de pagamento)', () => {
    const body = { status: 'error', errorCode: 'PROVIDER_ERROR', message: 'Falha no provedor de pagamento.' };
    expect(HttpErrorUtil.extract(err(502, body), 'fallback')).toBe('Falha no provedor de pagamento.');
  });

  it('sem corpo → fallback com status', () => {
    expect(HttpErrorUtil.extract(err(503, null), 'Erro')).toBe('Erro (503)');
  });
});
