import { HttpErrorResponse } from '@angular/common/http';
import { API_ERROR_MESSAGES } from '../constants/api-error-messages.constant';
import { ApiErrorCode } from '../enums/api-error-code.enum';
import { ApiResponseUtil } from './api-response.util';

export abstract class HttpErrorUtil {
  public static extract(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0)
      return 'Sem conexao. Verifique sua internet e tente novamente.';

    const code: string | null = ApiResponseUtil.errorCode(err);
    const correlationId: string | null = ApiResponseUtil.correlationId(err);

    if (code)
      return HttpErrorUtil.withCorrelationId(HttpErrorUtil.messageForCode(code, fallback, ApiResponseUtil.fields(err)), correlationId);

    if (err.status === 401)
      return HttpErrorUtil.withCorrelationId(HttpErrorUtil.messageForCode(ApiErrorCode.Unauthorized, fallback, null), correlationId);

    if (err.status === 403)
      return HttpErrorUtil.withCorrelationId(HttpErrorUtil.messageForCode(ApiErrorCode.Forbidden, fallback, null), correlationId);

    if (err.status === 404)
      return HttpErrorUtil.withCorrelationId(HttpErrorUtil.messageForCode(ApiErrorCode.NotFound, fallback, null), correlationId);

    return HttpErrorUtil.withCorrelationId(`${fallback} (${err.status})`, correlationId);
  }

  public static isUnauthorized(err: HttpErrorResponse): boolean {
    return err.status === 401 || ApiResponseUtil.errorCode(err) === ApiErrorCode.Unauthorized;
  }

  public static isForbidden(err: HttpErrorResponse): boolean {
    return err.status === 403 || ApiResponseUtil.errorCode(err) === ApiErrorCode.Forbidden;
  }

  public static messageForCode(code: string, fallback: string, fields: Record<string, string[]> | null): string {
    if (code === ApiErrorCode.ValidationError) {
      const fieldsMessage: string = HttpErrorUtil.fieldsMessage(fields);

      if (fieldsMessage)
        return fieldsMessage;
    }

    return API_ERROR_MESSAGES[code as ApiErrorCode] ?? fallback;
  }

  public static fieldsMessage(fields: Record<string, string[]> | null): string {
    if (!fields)
      return '';

    const messages: string[] = [];

    Object.entries(fields).forEach(([field, codes]: [string, string[]]): void => {
      codes.forEach((fieldCode: string): void => {
        messages.push(`${field}: ${HttpErrorUtil.messageForCode(fieldCode, 'Campo invalido.', null)}`);
      });
    });

    return messages.join(' ');
  }

  public static withCorrelationId(message: string, correlationId: string | null): string {
    if (!correlationId)
      return message;

    return `${message} Codigo de suporte: ${correlationId}.`;
  }
}
