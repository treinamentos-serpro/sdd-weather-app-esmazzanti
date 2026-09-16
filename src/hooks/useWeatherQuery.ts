import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchWeatherForCity } from '../services/weatherService';
import type { ApiError } from '../types/api';
import type { City, Unit, WeatherData } from '../types/weather';

interface UseWeatherQueryParams {
  city: City | null;
  unit: Unit;
}

interface UseWeatherQueryState {
  weather: WeatherData | null;
  loading: boolean;
  success: boolean;
  error: ApiError | null;
  empty: boolean;
  stale: boolean;
}

const weatherCache = new Map<string, WeatherData>();

function getWeatherCacheKey(city: City, unit: Unit): string {
  return `weather:${city.id}:${unit}`;
}

function isStaleData(weather: WeatherData): boolean {
  const fetchedAt = new Date(weather.fetchedAt).getTime();
  const ageMs = Date.now() - fetchedAt;

  return ageMs >= 10 * 60 * 1000 && ageMs < 60 * 60 * 1000;
}

function isUsableWeather(weather: WeatherData): boolean {
  const fetchedAt = new Date(weather.fetchedAt).getTime();
  return Number.isFinite(fetchedAt) && Date.now() - fetchedAt < 60 * 60 * 1000;
}

function toApiError(error: unknown): ApiError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'recoverable' in error &&
    'canRetry' in error
  ) {
    return error as ApiError;
  }

  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : 'Erro ao carregar o clima.',
    recoverable: true,
    canRetry: true,
  };
}

function getCachedWeather(city: City, unit: Unit): WeatherData | null {
  return weatherCache.get(getWeatherCacheKey(city, unit)) ?? null;
}

export function useWeatherQuery({ city, unit }: UseWeatherQueryParams) {
  const [state, setState] = useState<UseWeatherQueryState>({
    weather: null,
    loading: false,
    success: false,
    error: null,
    empty: true,
    stale: false,
  });
  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(
    async (force = false) => {
      if (!city) {
        controllerRef.current?.abort();
        requestIdRef.current += 1;
        setState({
          weather: null,
          loading: false,
          success: false,
          error: null,
          empty: true,
          stale: false,
        });
        return;
      }

      controllerRef.current?.abort();
      const cacheKey = getWeatherCacheKey(city, unit);
      const cachedWeather = getCachedWeather(city, unit);

      if (!force && cachedWeather) {
        const ageMs = Date.now() - new Date(cachedWeather.fetchedAt).getTime();

        if (ageMs <= 10 * 60 * 1000) {
          setState({
            weather: cachedWeather,
            loading: false,
            success: true,
            error: null,
            empty: false,
            stale: false,
          });
          return;
        }

        if (ageMs < 60 * 60 * 1000) {
          setState({
            weather: cachedWeather,
            loading: false,
            success: true,
            error: null,
            empty: false,
            stale: true,
          });
          if (!force) {
            return;
          }
        }
      }

      const nextRequestId = requestIdRef.current + 1;
      requestIdRef.current = nextRequestId;
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((currentState) => ({
        ...currentState,
        loading: true,
        success: false,
        error: null,
        empty: false,
      }));

      try {
        const weather = await fetchWeatherForCity(city, unit, controller.signal);

        if (nextRequestId !== requestIdRef.current) {
          return;
        }

        if (!isUsableWeather(weather)) {
          setState({
            weather: null,
            loading: false,
            success: false,
            error: {
              type: 'unknown',
              message: 'Os dados meteorológicos estão desatualizados. Tente novamente.',
              recoverable: true,
              canRetry: true,
            },
            empty: true,
            stale: false,
          });
          return;
        }

        weatherCache.set(cacheKey, weather);

        setState({
          weather,
          loading: false,
          success: true,
          error: null,
          empty: false,
          stale: isStaleData(weather) || weather.isStale,
        });
      } catch (error) {
        if (nextRequestId !== requestIdRef.current) {
          return;
        }

        const fallbackWeather = getCachedWeather(city, unit);
        const usableFallback =
          fallbackWeather && isUsableWeather(fallbackWeather) ? fallbackWeather : null;
        setState({
          weather: usableFallback,
          loading: false,
          success: false,
          error: toApiError(error),
          empty: usableFallback === null,
          stale: usableFallback ? isStaleData(usableFallback) : false,
        });
      }
    },
    [city, unit],
  );

  useEffect(() => {
    void refresh(false);
    return () => {
      requestIdRef.current += 1;
      controllerRef.current?.abort();
    };
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [refresh, state],
  );
}
