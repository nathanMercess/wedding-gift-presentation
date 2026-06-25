export type ApiError = {
  code: string;
  fields?: Record<string, string[]> | null;
  details?: unknown | null;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  correlationId: string;
};
