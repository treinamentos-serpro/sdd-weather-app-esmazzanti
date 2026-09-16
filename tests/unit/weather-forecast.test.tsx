import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WeatherForecast from '../../src/components/WeatherForecast';
import type { ForecastDay } from '../../src/types/weather';

function createDay(date: string, label: string, index: number): ForecastDay {
  return {
    date,
    weatherCode: index,
    weatherLabel: label,
    weatherIcon: index === 0 ? 'clear' : 'rain',
    temperatureMin: 18 + index,
    temperatureMax: 25 + index,
    precipitationProbability: index === 0 ? 10 : 40,
  };
}

describe('WeatherForecast', () => {
  it('renders five days with conditions, temperatures, icons, and precipitation', () => {
    render(
      <WeatherForecast
        unit="celsius"
        forecast={[
          createDay('2026-09-16', 'Céu limpo', 0),
          createDay('2026-09-17', 'Chuva', 1),
          createDay('2026-09-18', 'Chuva', 2),
          createDay('2026-09-19', 'Chuva', 3),
          createDay('2026-09-20', 'Chuva', 4),
        ]}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(screen.getByText('16/09/2026')).toBeInTheDocument();
    expect(within(items[0]).getByText('Mínima: 18.0 °C')).toBeInTheDocument();
    expect(within(items[0]).getByText('Máxima: 25.0 °C')).toBeInTheDocument();
    expect(screen.getByText('clear')).toBeInTheDocument();
    expect(within(items[1]).getByText('Chuva: 40%')).toBeInTheDocument();
  });

  it('preserves the chronological order provided by the API', () => {
    render(
      <WeatherForecast
        unit="celsius"
        forecast={[
          createDay('2026-09-16', 'Hoje', 0),
          createDay('2026-09-17', 'Amanhã', 1),
          createDay('2026-09-18', 'Depois', 2),
        ]}
      />,
    );

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      '16/09/2026',
      '17/09/2026',
      '18/09/2026',
    ]);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Previsão incompleta: 3 dias disponíveis.',
    );
  });

  it('shows unavailable for missing optional values and applies Fahrenheit', () => {
    render(
      <WeatherForecast
        unit="fahrenheit"
        forecast={[
          {
            ...createDay('2026-09-16', 'Céu limpo', 0),
            weatherIcon: '',
            temperatureMin: null,
            temperatureMax: 70,
            precipitationProbability: null,
          },
        ]}
      />,
    );

    const item = screen.getByRole('listitem');
    expect(within(item).getByText('Mínima: Indisponível')).toBeInTheDocument();
    expect(within(item).getByText('Máxima: 70.0 °F')).toBeInTheDocument();
    expect(within(item).queryByText(/Chuva:/)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Previsão incompleta: 1 dia disponível.');
  });
});
