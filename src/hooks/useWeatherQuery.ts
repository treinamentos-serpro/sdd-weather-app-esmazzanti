import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchWeatherForCity } from '../services/weatherService';
import type { City, Unit, WeatherData } from '../types/weather';

interface UseWeatherQueryParams {
  city: City;
  unit: Unit;
}

interface UseWeatherQueryState {
  weather: WeatherData | null;
  loading: boolean;
  success: boolean;
  error: string | null;
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

  const refresh = useCallback(
    async (force = false) => {
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

      setState((currentState) => ({
        ...currentState,
        loading: true,
        success: false,
        error: null,
        empty: false,
      }));

      try {
        const weather = await fetchWeatherForCity(city, unit);

        if (nextRequestId !== requestIdRef.current) {
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
        setState({
          weather: fallbackWeather,
          loading: false,
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar clima.',
          empty: fallbackWeather === null,
          stale: fallbackWeather ? isStaleData(fallbackWeather) : false,
        });
      }
    },
    [city, unit],
  );

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [refresh, state],
  );
}
