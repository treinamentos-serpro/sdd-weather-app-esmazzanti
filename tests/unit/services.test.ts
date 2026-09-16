import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestJson } from '../../src/services/apiClient';
import { searchCities } from '../../src/services/geocodingService';
import { fetchWeatherForCity } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 10,
  name: 'São Paulo',
  country: 'Brasil',
  admin1: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('serviços de integração', () => {
  it('mapeia geocoding e envia os parâmetros de idioma e quantidade', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        results: [
          {
            id: 10,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' São  Paulo ')).resolves.toEqual([city]);

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('language=pt');
    expect(url).toContain('count=10');
    expect(url).toContain('format=json');
  });

  it('normaliza forecast e envia coordenadas, campos e unidade ativa', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-09-16T12:00',
          temperature_2m: 69.8,
          apparent_temperature: 71,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 61,
        },
        daily: {
          time: ['2026-09-16'],
          weather_code: [61],
          temperature_2m_min: [60],
          temperature_2m_max: [75],
          precipitation_probability_max: [40],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const weather = await fetchWeatherForCity(city, 'fahrenheit');
    const url = String(fetchMock.mock.calls[0][0]);

    expect(url).toContain('latitude=-23.55');
    expect(url).toContain('longitude=-46.63');
    expect(url).toContain(
      'current=temperature_2m%2Capparent_temperature%2Crelative_humidity_2m%2Cwind_speed_10m%2Cweather_code',
    );
    expect(url).toContain(
      'daily=weather_code%2Ctemperature_2m_min%2Ctemperature_2m_max%2Cprecipitation_probability_max',
    );
    expect(url).toContain('timezone=auto');
    expect(url).toContain('forecast_days=5');
    expect(url).toContain('temperature_unit=fahrenheit');
    expect(weather.current.unit).toBe('fahrenheit');
    expect(weather.forecast[0].weatherLabel).toBe('Chuva');
  });

  it('classifica timeout, limite e rede com metadados de ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError')));
    await expect(requestJson('https://example.com')).rejects.toMatchObject({
      type: 'timeout',
      recoverable: true,
      canRetry: true,
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      }),
    );
    await expect(requestJson('https://example.com')).rejects.toMatchObject({
      type: 'rate-limit',
      message: expect.stringContaining('Limite'),
      recoverable: true,
      canRetry: true,
    });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
    await expect(requestJson('https://example.com')).rejects.toMatchObject({
      type: 'network',
      message: expect.any(String),
      recoverable: true,
      canRetry: true,
    });
  });
});
