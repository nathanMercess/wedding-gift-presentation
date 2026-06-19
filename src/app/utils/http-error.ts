import { HttpErrorResponse } from '@angular/common/http';

export abstract class HttpErrorUtil {
  public static extract(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0)
      return 'Sem conexão. Verifique sua internet e tente novamente.';

    const body = err.error;

    if (!body)
      return `${fallback} (${err.status})`;

    if (body.errors) {
      const messages = (Object.values(body.errors) as string[][]).flat();
      return messages.length ? messages.join(' ') : (body.title || fallback);
    }

    return body.detail || body.title || body.message || `${fallback} (${err.status})`;
  }
}
