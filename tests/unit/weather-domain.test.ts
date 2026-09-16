import { describe, expect, it, vi } from 'vitest';
import { celsiusToFahrenheit, fahrenheitToCelsius } from '../../src/lib/temperature';
import { getWmoWeatherInfo } from '../../src/lib/wmoMapping';
import { searchCities } from '../../src/services/geocodingService';

describe('weather domain utilities', () => {
  it('converts temperatures with the required formulas', () => {
    expect(celsiusToFahrenheit(0)).toBeCloseTo(32, 1);
    expect(celsiusToFahrenheit(20)).toBeCloseTo(68, 1);
    expect(fahrenheitToCelsius(32)).toBeCloseTo(0, 1);
    expect(fahrenheitToCelsius(68)).toBeCloseTo(20, 1);
  });

  it('maps supported WMO codes to labels and icons', () => {
    expect(getWmoWeatherInfo(0)).toEqual({ label: 'Céu limpo', icon: 'clear' });
    expect(getWmoWeatherInfo(45)).toEqual({ label: 'Nevoeiro', icon: 'fog' });
    expect(getWmoWeatherInfo(61)).toEqual({ label: 'Chuva', icon: 'rain' });
    expect(getWmoWeatherInfo(99)).toEqual({ label: 'Tempestade', icon: 'thunderstorm' });
  });

  it('returns unavailable metadata for unknown WMO codes', () => {
    expect(getWmoWeatherInfo(999)).toEqual({ label: 'Indisponível', icon: 'Indisponível' });
  });
});

describe('geocoding service', () => {
  it('requests normalized city names and maps valid results to the domain model', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        results: [
          {
            id: 123,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
          {
            id: 456,
            name: 'São Paulo',
            country: 'Argentina',
            admin1: 'Buenos Aires',
            latitude: -34.6,
            longitude: -58.38,
          },
          {
            id: 789,
            name: 'Rio',
            country: 'Brasil',
            admin1: null,
            latitude: 'invalid' as unknown as number,
            longitude: -43.2,
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const results = await searchCities('   são  paulo   ');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://geocoding-api.open-meteo.com/v1/search?'),
      expect.objectContaining({
        method: 'GET',
      }),
    );
    expect(fetchMock.mock.calls[0][0]).toContain('name=s%C3%A3o%20paulo');
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: 123,
      name: 'São Paulo',
      country: 'Brasil',
      admin1: 'São Paulo',
    });
  });
});
