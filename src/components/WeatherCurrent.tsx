import type { WeatherData } from '../types/weather';

interface WeatherCurrentProps {
  weather: WeatherData;
}

const unavailableLabel = 'Indisponível';

function formatTemperature(value: number | null, unit: WeatherData['current']['unit']): string {
  if (value === null || !Number.isFinite(value)) {
    return unavailableLabel;
  }

  return `${value.toFixed(1)} °${unit === 'celsius' ? 'C' : 'F'}`;
}

function formatValue(value: number | null, suffix: string): string {
  if (value === null || !Number.isFinite(value)) {
    return unavailableLabel;
  }

  return `${value} ${suffix}`;
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return unavailableLabel;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export default function WeatherCurrent({ weather }: WeatherCurrentProps) {
  const { city, current } = weather;

  if (
    current.temperature === null ||
    !Number.isFinite(current.temperature) ||
    !current.weatherLabel.trim()
  ) {
    return null;
  }

  return (
    <section
      aria-labelledby="weather-current-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="weather-current-title" className="text-2xl font-semibold text-white">
            {city.name}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{city.country ?? unavailableLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-white">
            {formatTemperature(current.temperature, current.unit)}
          </p>
          <p className="mt-1 text-sm text-accent-400">{current.weatherLabel}</p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">Sensação térmica</dt>
          <dd className="mt-1 font-medium text-white">
            {formatTemperature(current.apparentTemperature, current.unit)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Umidade</dt>
          <dd className="mt-1 font-medium text-white">{formatValue(current.humidity, '%')}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Velocidade do vento</dt>
          <dd className="mt-1 font-medium text-white">{formatValue(current.windSpeed, 'km/h')}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Atualizado em</dt>
          <dd className="mt-1 font-medium text-white">{formatUpdatedAt(weather.fetchedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}
