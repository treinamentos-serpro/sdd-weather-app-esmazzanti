import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WeatherCurrent from '../../src/components/WeatherCurrent';
import type { WeatherData } from '../../src/types/weather';

const weather: WeatherData = {
  city: {
    id: 1,
    name: 'São Paulo',
    country: 'Brasil',
    admin1: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
  },
  current: {
    time: '2026-09-16T12:00:00Z',
    temperature: 21,
    apparentTemperature: 22,
    humidity: 60,
    windSpeed: 10,
    weatherCode: 61,
    weatherLabel: 'Chuva',
    weatherIcon: 'rain',
    unit: 'celsius',
  },
  forecast: [],
  fetchedAt: '2026-09-16T12:00:00Z',
  isStale: false,
};

describe('WeatherCurrent', () => {
  it('renders the city, current conditions, metrics, and update time', () => {
    render(<WeatherCurrent weather={weather} />);

    expect(screen.getByRole('region', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText('Brasil')).toBeInTheDocument();
    expect(screen.getByText('21.0 °C')).toBeInTheDocument();
    expect(screen.getByText('Chuva')).toBeInTheDocument();
    expect(screen.getByText('22.0 °C')).toBeInTheDocument();
    expect(screen.getByText('60 %')).toBeInTheDocument();
    expect(screen.getByText('10 km/h')).toBeInTheDocument();
    expect(screen.getByText(/16\/09\/2026/)).toBeInTheDocument();
  });

  it('applies Fahrenheit to all displayed temperature values', () => {
    render(
      <WeatherCurrent
        weather={{
          ...weather,
          current: {
            ...weather.current,
            temperature: 68,
            apparentTemperature: 70,
            unit: 'fahrenheit',
          },
        }}
      />,
    );

    expect(screen.getByText('68.0 °F')).toBeInTheDocument();
    expect(screen.getByText('70.0 °F')).toBeInTheDocument();
  });

  it('shows unavailable for missing optional values', () => {
    render(
      <WeatherCurrent
        weather={{
          ...weather,
          city: { ...weather.city, country: null },
          current: {
            ...weather.current,
            apparentTemperature: null,
            humidity: null,
            windSpeed: null,
          },
          fetchedAt: 'invalid-date',
        }}
      />,
    );

    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
  });

  it('does not render when a required current field is unavailable', () => {
    const { container } = render(
      <WeatherCurrent
        weather={{ ...weather, current: { ...weather.current, temperature: null } }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
