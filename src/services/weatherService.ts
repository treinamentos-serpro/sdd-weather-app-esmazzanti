import { getWmoWeatherInfo } from '../lib/wmoMapping';
import type { City, CurrentWeather, ForecastDay, Unit, WeatherData } from '../types/weather';
import { requestJson } from './apiClient';

interface OpenMeteoForecastResponse {
  timezone?: string | null;
  current?: {
    time?: string | null;
    temperature_2m?: number | null;
    apparent_temperature?: number | null;
    relative_humidity_2m?: number | null;
    wind_speed_10m?: number | null;
    weather_code?: number | null;
  } | null;
  daily?: {
    time?: string[] | null;
    weather_code?: number[] | null;
    temperature_2m_min?: number[] | null;
    temperature_2m_max?: number[] | null;
    precipitation_probability_max?: number[] | null;
  } | null;
}

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherForCity(
  city: City,
  unit: Unit,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: unit,
  });

  const payload = await requestJson<OpenMeteoForecastResponse>(
    `${WEATHER_URL}?${params.toString()}`,
    {
      timeoutMs: 8000,
      signal,
    },
  );

  const current = payload.current ?? {};
  const daily = payload.daily ?? {};
  const dailyTimes = daily.time ?? [];
  const weatherCodes = daily.weather_code ?? [];
  const mins = daily.temperature_2m_min ?? [];
  const maxs = daily.temperature_2m_max ?? [];
  const precipitation = daily.precipitation_probability_max ?? [];

  const currentWeather: CurrentWeather = {
    time: current.time ?? null,
    temperature: typeof current.temperature_2m === 'number' ? current.temperature_2m : null,
    apparentTemperature:
      typeof current.apparent_temperature === 'number' ? current.apparent_temperature : null,
    humidity:
      typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : null,
    windSpeed: typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : null,
    weatherCode: typeof current.weather_code === 'number' ? current.weather_code : null,
    weatherLabel: getWeatherLabel(current.weather_code),
    weatherIcon: getWeatherIcon(current.weather_code),
    unit,
  };

  const forecast: ForecastDay[] = dailyTimes.map((date, index) => ({
    date,
    weatherCode: typeof weatherCodes[index] === 'number' ? weatherCodes[index] : null,
    weatherLabel: getWeatherLabel(weatherCodes[index]),
    weatherIcon: getWeatherIcon(weatherCodes[index]),
    temperatureMin: typeof mins[index] === 'number' ? mins[index] : null,
    temperatureMax: typeof maxs[index] === 'number' ? maxs[index] : null,
    precipitationProbability:
      typeof precipitation[index] === 'number' ? precipitation[index] : null,
  }));

  return {
    city,
    current: currentWeather,
    forecast,
    fetchedAt: new Date().toISOString(),
    timezone: payload.timezone ?? null,
    isStale: false,
  };
}

function getWeatherLabel(code: number | null | undefined): string {
  return getWmoWeatherInfo(code).label;
}

function getWeatherIcon(code: number | null | undefined): string {
  return getWmoWeatherInfo(code).icon;
}
