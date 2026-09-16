import type { ForecastDay, Unit } from '../types/weather';

interface WeatherForecastProps {
  forecast: ForecastDay[];
  unit: Unit;
}

const unavailableLabel = 'Indisponível';

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return unavailableLabel;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

function formatTemperature(value: number | null, unit: Unit): string {
  if (value === null || !Number.isFinite(value)) {
    return unavailableLabel;
  }

  return `${value.toFixed(1)} °${unit === 'celsius' ? 'C' : 'F'}`;
}

function formatProbability(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return unavailableLabel;
  }

  return `${value}%`;
}

export default function WeatherForecast({ forecast, unit }: WeatherForecastProps) {
  return (
    <section aria-labelledby="weather-forecast-title" className="mt-6">
      <h2 id="weather-forecast-title" className="text-2xl font-semibold text-white">
        Previsão para cinco dias
      </h2>

      {forecast.length < 5 ? (
        <p className="mt-2 text-sm text-slate-300" role="status">
          Previsão incompleta: {forecast.length}{' '}
          {forecast.length === 1 ? 'dia disponível' : 'dias disponíveis'}.
        </p>
      ) : null}

      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <li key={day.date} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <h3 className="font-semibold text-white">{formatDate(day.date)}</h3>
            <p className="mt-2 text-accent-400">{day.weatherLabel.trim() || unavailableLabel}</p>
            {day.weatherIcon.trim() ? (
              <span
                className="mt-2 block text-xs text-slate-300"
                role="img"
                aria-label={`Ícone do tempo: ${day.weatherIcon}`}
              >
                {day.weatherIcon}
              </span>
            ) : null}
            <dl className="mt-4 space-y-2 text-slate-300">
              <div>
                <dt className="sr-only">Temperatura mínima</dt>
                <dd>Mínima: {formatTemperature(day.temperatureMin, unit)}</dd>
              </div>
              <div>
                <dt className="sr-only">Temperatura máxima</dt>
                <dd>Máxima: {formatTemperature(day.temperatureMax, unit)}</dd>
              </div>
              {day.precipitationProbability !== null ? (
                <div>
                  <dt className="sr-only">Probabilidade de precipitação</dt>
                  <dd>Chuva: {formatProbability(day.precipitationProbability)}</dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
