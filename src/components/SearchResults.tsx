import { memo, useEffect, useRef } from 'react';
import type { City } from '../types/weather';

interface SearchResultsProps {
  results: City[];
  loading?: boolean;
  empty: boolean;
  onSelectCity: (city: City) => void;
}

const SearchResults = memo(function SearchResults({
  results,
  loading = false,
  empty,
  onSelectCity,
}: SearchResultsProps) {
  const firstResultRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (results.length > 0) {
      firstResultRef.current?.focus();
    }
  }, [results]);

  if (empty) {
    return (
      <div
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"
        role="status"
        aria-busy={loading}
      >
        Nenhuma cidade encontrada para a busca informada.
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
      role="region"
      aria-label="Resultados de busca"
      aria-busy={loading}
    >
      <div className="divide-y divide-white/10">
        {results.map((city, index) => {
          const isValidSelection =
            Number.isFinite(city.latitude) && Number.isFinite(city.longitude);

          return (
            <div key={city.id} className="w-full">
              <button
                type="button"
                ref={index === 0 ? firstResultRef : undefined}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition enabled:hover:bg-white/5 enabled:focus:bg-white/5 enabled:focus:outline-none enabled:focus:ring-2 enabled:focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => isValidSelection && onSelectCity(city)}
                disabled={!isValidSelection}
                aria-label={`Selecionar ${city.name}`}
              >
                <span>
                  <span className="block font-medium text-white">{city.name}</span>
                  <span className="block text-sm text-slate-300">
                    {city.admin1 ?? 'Indisponível'} · {city.country ?? 'Indisponível'}
                  </span>
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-accent-400">
                  {isValidSelection ? 'OK' : 'Indisponível'}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default SearchResults;
