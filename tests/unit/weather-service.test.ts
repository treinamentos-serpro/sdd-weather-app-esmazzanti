import { describe, expect, it, vi } from 'vitest';
import { fetchWeatherForCity } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

describe('weather service', () => {
  it('maps the Open-Meteo response into the internal weather model', async () => {
    const city: City = {
      id: 1,
      name: 'São Paulo',
      country: 'Brasil',
      admin1: 'São Paulo',
      latitude: -23.55,
      longitude: -46.63,
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2024-01-01T12:00',
            temperature_2m: 21.5,
            apparent_temperature: 23.1,
            relative_humidity_2m: 65,
            wind_speed_10m: 12.4,
            weather_code: 61,
          },
          daily: {
            time: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
            weather_code: [61, 1, 2, 3, 45],
            temperature_2m_min: [18, 17, 16, 18, 19],
            temperature_2m_max: [28, 27, 25, 24, 23],
            precipitation_probability_max: [35, 20, 10, 30, 40],
          },
        }),
      }),
    );

    const weather = await fetchWeatherForCity(city, 'celsius');

    expect(weather.current.temperature).toBe(21.5);
    expect(weather.current.weatherLabel).toBe('Chuva');
    expect(weather.current.weatherIcon).toBe('rain');
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0].temperatureMax).toBe(28);
    expect(weather.forecast[4].weatherLabel).toBe('Nevoeiro');
  });
});
