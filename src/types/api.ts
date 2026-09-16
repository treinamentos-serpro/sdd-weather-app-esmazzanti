export type ApiErrorType =
  | 'validation'
  | 'not-found'
  | 'network'
  | 'timeout'
  | 'http'
  | 'rate-limit'
  | 'unknown';

export interface ApiError {
  type: ApiErrorType;
  message: string;
  recoverable: boolean;
  canRetry: boolean;
  statusCode?: number;
}

export interface GeocodingApiResult {
  id?: number | null;
  name?: string | null;
  country?: string | null;
  admin1?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface GeocodingApiResponse {
  results?: GeocodingApiResult[] | null;
}
