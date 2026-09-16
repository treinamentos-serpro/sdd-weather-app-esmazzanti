import type { ApiError } from '../types/api';

interface RequestOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const controller = new AbortController();

  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const signal = options.signal ?? controller.signal;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', ...(options.headers ?? {}) },
      signal,
    });

    if (!response.ok) {
      const error = buildApiError(response.status, response.statusText);
      throw error;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json') && !contentType.includes('+json')) {
      throw buildApiError(500, 'Resposta inválida do servidor');
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw buildApiError(408, 'Tempo limite excedido');
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'message' in error &&
      'recoverable' in error &&
      'canRetry' in error
    ) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw buildApiError(503, 'Falha de conexão com o servidor');
    }

    throw buildApiError(500, 'Erro ao processar a resposta');
  } finally {
    globalThis.clearTimeout(timeoutId);
    if (options.signal === undefined) {
      controller.abort();
    }
  }
}

function buildApiError(statusCode: number, message: string): ApiError {
  if (statusCode === 429) {
    return {
      type: 'rate-limit',
      message: 'Limite de requisições excedido. Tente novamente em alguns instantes.',
      recoverable: true,
      canRetry: true,
      statusCode,
    };
  }

  if (statusCode === 408 || statusCode === 504) {
    return {
      type: 'timeout',
      message: 'A consulta demorou demais e foi cancelada.',
      recoverable: true,
      canRetry: true,
      statusCode,
    };
  }

  if (statusCode >= 500) {
    return {
      type: 'http',
      message: 'Houve um problema no serviço de clima. Tente novamente.',
      recoverable: true,
      canRetry: true,
      statusCode,
    };
  }

  if (statusCode >= 400) {
    return {
      type: 'http',
      message: message || 'Não foi possível completar a consulta.',
      recoverable: false,
      canRetry: false,
      statusCode,
    };
  }

  return {
    type: 'unknown',
    message: message || 'Erro inesperado ao consultar os dados.',
    recoverable: true,
    canRetry: true,
    statusCode,
  };
}
