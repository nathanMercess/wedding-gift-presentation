export abstract class JwtUtil {
  public static decodePayload(token: string): Record<string, unknown> | null {
    const parts: string[] = token.split('.');

    if (parts.length !== 3)
      return null;

    try {
      const base64: string = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  public static isExpired(token: string): boolean {
    const payload: Record<string, unknown> | null = JwtUtil.decodePayload(token);

    if (!payload || typeof payload['exp'] !== 'number')
      return true;

    return Date.now() >= (payload['exp'] as number) * 1000;
  }
}
