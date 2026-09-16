import type { FormEvent } from 'react';

interface SearchFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export default function SearchForm({ value, onChange, onSubmit, loading, error }: SearchFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Busca por cidade"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="city-search" className="sr-only">
          Nome da cidade
        </label>
        <input
          id="city-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading}
          placeholder="Digite a cidade"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'city-search-error' : undefined}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-accent-500 px-5 py-3 font-medium text-white transition enabled:hover:bg-accent-400 enabled:focus:outline-none enabled:focus:ring-2 enabled:focus:ring-accent-400/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-300" role="status" aria-live="polite">
          Buscando cidades...
        </p>
      ) : null}

      {error ? (
        <p id="city-search-error" className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
