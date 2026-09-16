import { useMemo, useState } from 'react';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import { useCitySearch } from './hooks/useCitySearch';
import { normalizeSearchText, validateSearchText } from './lib/validation';
import type { City } from './types/weather';

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const { results, loading, error, empty, search } = useCitySearch();

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
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass backdrop-blur-md">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-accent-400">
          Weather App
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          SDD Weather App
        </h1>
        <p className="mt-4 text-lg text-slate-200">Previsão do tempo</p>

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

        {selectedCity ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Cidade selecionada: {selectedCity.name} ({selectedCity.country ?? 'Indisponível'})
          </div>
        ) : null}
      </div>
    </main>
  );
}
