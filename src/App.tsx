import { useMemo, useState } from 'react';
import FooterAttribution from './components/FooterAttribution';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import StatusMessage from './components/StatusMessage';
import UnitToggle from './components/UnitToggle';
import WeatherCurrent from './components/WeatherCurrent';
import WeatherForecast from './components/WeatherForecast';
import { useCitySearch } from './hooks/useCitySearch';
import { usePersistentUnit } from './hooks/usePersistentUnit';
import { useWeatherQuery } from './hooks/useWeatherQuery';
import { normalizeSearchText, validateSearchText } from './lib/validation';
import type { City } from './types/weather';

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const { results, loading, error, empty, search } = useCitySearch();
  const { unit, setUnit } = usePersistentUnit();
  const weatherQuery = useWeatherQuery({ city: selectedCity, unit });

  const validationError = useMemo(() => validateSearchText(query), [query]);

  const handleSubmit = () => {
    if (validationError) {
      return;
    }

    const normalized = normalizeSearchText(query);
    if (!normalized) {
      return;
    }

    void search(normalized);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-night-900 px-4 py-10 text-white">
      <div className="w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-accent-400">
              Weather App
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              SDD Weather App
            </h1>
            <p className="mt-4 text-lg text-slate-200">Previsão do tempo</p>
          </div>
          <UnitToggle value={unit} onChange={setUnit} />
        </div>

        <div className="mt-6">
          <SearchForm
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            loading={loading}
            error={validationError ?? error}
          />
          <SearchResults
            results={results}
            empty={empty}
            onSelectCity={(city) => {
              setSelectedCity(city);
            }}
          />
        </div>

        {!selectedCity ? (
          <StatusMessage message="Busque e escolha uma cidade para ver a previsão do tempo." />
        ) : null}

        {selectedCity ? (
          <div aria-live="polite">
            {weatherQuery.loading ? (
              <StatusMessage message="Carregando previsão do tempo..." />
            ) : null}

            {weatherQuery.error ? (
              <StatusMessage
                message={weatherQuery.error.message}
                error={weatherQuery.error}
                onRetry={
                  weatherQuery.error.canRetry ? () => void weatherQuery.refresh(true) : undefined
                }
              />
            ) : null}

            {weatherQuery.stale ? (
              <StatusMessage
                message="Dados possivelmente desatualizados."
                tone="warning"
                actionLabel="Atualizar"
                onRetry={() => void weatherQuery.refresh(true)}
              />
            ) : null}

            {weatherQuery.weather ? (
              <div className="mt-6">
                <WeatherCurrent weather={weatherQuery.weather} />
                <WeatherForecast
                  forecast={weatherQuery.weather.forecast}
                  unit={weatherQuery.weather.current.unit}
                />
                <FooterAttribution />
              </div>
            ) : null}

            {weatherQuery.empty && !weatherQuery.loading && !weatherQuery.error ? (
              <StatusMessage message="Nenhum dado meteorológico disponível para esta cidade." />
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
