import { HttpErrorResponse } from '@angular/common/http';
import { OperatorFunction, map } from 'rxjs';
import { ApiError, ApiResponse } from '../models/api-response.model';

export abstract class ApiResponseUtil {
  public static data<T>(fallback: string): OperatorFunction<ApiResponse<T>, T> {
    return map((response: ApiResponse<T>): T => ApiResponseUtil.requireData(response, fallback));
  }

  public static nullableData<T>(fallback: string): OperatorFunction<ApiResponse<T>, T | null> {
    return map((response: ApiResponse<T>): T | null => ApiResponseUtil.unwrapNullable(response, fallback));
  }

  public static requireData<T>(response: ApiResponse<T>, fallback: string): T {
    const data: T | null = ApiResponseUtil.unwrapNullable(response, fallback);

    if (data === null)
      throw ApiResponseUtil.toHttpError(response, fallback);

    return data;
  }

  public static unwrapNullable<T>(response: ApiResponse<T>, fallback: string): T | null {
    if (!ApiResponseUtil.isApiResponse(response))
      throw ApiResponseUtil.toHttpError(response, fallback);

    if (!response.success)
      throw ApiResponseUtil.toHttpError(response, fallback);

    return response.data;
  }

  public static toHttpError(response: unknown, fallback: string): HttpErrorResponse {
    return new HttpErrorResponse({ status: 200, statusText: fallback, error: response });
  }

  public static errorCode(err: HttpErrorResponse): string | null {
    const body: unknown = err.error;

    if (ApiResponseUtil.isApiResponse(body))
      return body.error?.code ?? null;

    if (ApiResponseUtil.isApiError(body))
      return body.code;

    return null;
  }

  public static fields(err: HttpErrorResponse): Record<string, string[]> | null {
    const body: unknown = err.error;

    if (ApiResponseUtil.isApiResponse(body))
      return body.error?.fields ?? null;

    if (ApiResponseUtil.isApiError(body))
      return body.fields ?? null;

    return null;
  }

  public static correlationId(err: HttpErrorResponse): string | null {
    const body: unknown = err.error;

    if (ApiResponseUtil.isApiResponse(body))
      return body.correlationId;

    if (!ApiResponseUtil.isRecord(body))
      return null;

    const correlationId: unknown = body['correlationId'];

    if (typeof correlationId !== 'string')
      return null;

    return correlationId;
  }

  public static isApiResponse(value: unknown): value is ApiResponse<unknown> {
    if (!ApiResponseUtil.isRecord(value))
      return false;

    return typeof value['success'] === 'boolean' && typeof value['correlationId'] === 'string';
  }

  public static isApiError(value: unknown): value is ApiError {
    if (!ApiResponseUtil.isRecord(value))
      return false;

    return typeof value['code'] === 'string';
  }

  public static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
