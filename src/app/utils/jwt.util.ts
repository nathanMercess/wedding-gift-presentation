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

  public static extractRoles(token: string): string[] {
    const payload: Record<string, unknown> | null = JwtUtil.decodePayload(token);

    if (!payload)
      return [];

    const claims: unknown[] = [
      payload['role'],
      payload['roles'],
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    ];
    const roles: string[] = claims.flatMap((claim: unknown): string[] => JwtUtil.normalizeRoles(claim));

    return Array.from(new Set(roles));
  }

  public static normalizeRoles(claim: unknown): string[] {
    if (typeof claim === 'string') {
      const role: string = claim.trim();
      return role ? [role] : [];
    }

    if (!Array.isArray(claim))
      return [];

    return claim
      .filter((role: unknown): role is string => typeof role === 'string')
      .map((role: string): string => role.trim())
      .filter((role: string): boolean => role.length > 0);
  }
}
