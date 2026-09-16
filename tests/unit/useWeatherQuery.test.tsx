import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeatherQuery } from '../../src/hooks/useWeatherQuery';
import { fetchWeatherForCity } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  fetchWeatherForCity: vi.fn(),
}));

const cityOne: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  admin1: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const cityTwo: City = {
  id: 2,
  name: 'Rio',
  country: 'Brasil',
  admin1: 'Rio de Janeiro',
  latitude: -22.9,
  longitude: -43.2,
};

const cityThree: City = {
  id: 3,
  name: 'Curitiba',
  country: 'Brasil',
  admin1: 'Paraná',
  latitude: -25.43,
  longitude: -49.27,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useWeatherQuery', () => {
  it('loads forecast for a selected city and exposes success state', async () => {
    const mockedFetch = vi.mocked(fetchWeatherForCity);
    mockedFetch.mockResolvedValue({
      city: cityOne,
      current: {
        time: '2024-01-01T12:00',
        temperature: 21,
        apparentTemperature: 22,
        humidity: 60,
        windSpeed: 10,
        weatherCode: 61,
        weatherLabel: 'Chuva',
        weatherIcon: 'rain',
        unit: 'celsius',
      },
      forecast: [
        {
          date: '2024-01-01',
          weatherCode: 61,
          weatherLabel: 'Chuva',
          weatherIcon: 'rain',
          temperatureMin: 19,
          temperatureMax: 24,
          precipitationProbability: 40,
        },
      ],
      fetchedAt: new Date().toISOString(),
      isStale: false,
    });

    const { result } = renderHook(() => useWeatherQuery({ city: cityOne, unit: 'celsius' }));

    await waitFor(() => {
      expect(result.current.success).toBe(true);
    });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(result.current.weather?.city.name).toBe('São Paulo');
  });

  it('marks stale data when it is older than 10 minutes but newer than 1 hour', async () => {
    const mockedFetch = vi.mocked(fetchWeatherForCity);
    mockedFetch.mockResolvedValue({
      city: cityTwo,
      current: {
        time: '2024-01-01T12:00',
        temperature: 28,
        apparentTemperature: 30,
        humidity: 70,
        windSpeed: 8,
        weatherCode: 1,
        weatherLabel: 'Predominantemente limpo',
        weatherIcon: 'mostly-clear',
        unit: 'celsius',
      },
      forecast: [],
      fetchedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isStale: true,
      staleReason: 'Dados possivelmente desatualizados',
    });

    const { result } = renderHook(() => useWeatherQuery({ city: cityTwo, unit: 'celsius' }));

    await waitFor(() => {
      expect(result.current.stale).toBe(true);
    });

    expect(result.current.weather?.staleReason).toBe('Dados possivelmente desatualizados');
  });

  it('ignores valid cache when refresh is forced', async () => {
    const mockedFetch = vi.mocked(fetchWeatherForCity);
    mockedFetch.mockResolvedValue({
      city: cityThree,
      current: {
        time: '2024-01-01T12:00',
        temperature: 18,
        apparentTemperature: 17,
        humidity: 55,
        windSpeed: 6,
        weatherCode: 0,
        weatherLabel: 'Céu limpo',
        weatherIcon: 'clear',
        unit: 'celsius',
      },
      forecast: [],
      fetchedAt: new Date().toISOString(),
      isStale: false,
    });

    const { result } = renderHook(() => useWeatherQuery({ city: cityThree, unit: 'celsius' }));

    await waitFor(() => {
      expect(result.current.success).toBe(true);
    });

    await act(async () => {
      await result.current.refresh(true);
    });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });
});
