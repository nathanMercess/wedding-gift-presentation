import { JwtUtil } from './jwt.util';

function makeToken(payload: Record<string, unknown>): string {
  const enc = (obj: object): string => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_');
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(payload)}.sig`;
}

describe('JwtUtil', () => {
  describe('decodePayload', () => {
    it('decodifica o payload de um JWT válido', () => {
      const token = makeToken({ sub: '123', role: 'Admin', exp: 1781817122 });
      const payload = JwtUtil.decodePayload(token);

      expect(payload).not.toBeNull();
      expect(payload!['role']).toBe('Admin');
      expect(payload!['sub']).toBe('123');
    });

    it('retorna null para tokens malformados', () => {
      expect(JwtUtil.decodePayload('abc')).toBeNull();
      expect(JwtUtil.decodePayload('a.b')).toBeNull();
      expect(JwtUtil.decodePayload('a.@@@.c')).toBeNull();
    });
  });

  describe('isExpired', () => {
    it('exp no passado → expirado', () => {
      const token = makeToken({ exp: Math.floor(Date.now() / 1000) - 60 });
      expect(JwtUtil.isExpired(token)).toBe(true);
    });

    it('exp no futuro → válido', () => {
      const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
      expect(JwtUtil.isExpired(token)).toBe(false);
    });

    it('sem claim exp → tratado como expirado (fail-safe)', () => {
      const token = makeToken({ sub: 'x' });
      expect(JwtUtil.isExpired(token)).toBe(true);
    });

    it('token malformado → expirado', () => {
      expect(JwtUtil.isExpired('garbage')).toBe(true);
    });

    it('token de homologação (exp 18/06/2026) está expirado em 19/06/2026', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-19T00:00:00Z'));
      const token = makeToken({ exp: 1781817122 });

      expect(JwtUtil.isExpired(token)).toBe(true);

      jest.useRealTimers();
    });
  });
});
