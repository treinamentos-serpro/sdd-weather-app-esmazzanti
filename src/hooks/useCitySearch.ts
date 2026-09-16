import { useCallback, useMemo, useRef, useState } from 'react';
import { searchCities } from '../services/geocodingService';
import type { City } from '../types/weather';

interface UseCitySearchState {
  results: City[];
  loading: boolean;
  error: string | null;
  empty: boolean;
}

export function useCitySearch() {
  const [state, setState] = useState<UseCitySearchState>({
    results: [],
    loading: false,
    error: null,
    empty: false,
  });
  const inFlightQuery = useRef<string | null>(null);

  const search = useCallback(async (query: string) => {
    const normalized = query.trim();

    if (!normalized || inFlightQuery.current === normalized) {
      return;
    }

    inFlightQuery.current = normalized;
    setState({ results: [], loading: true, error: null, empty: false });

    try {
      const results = await searchCities(normalized);
      const nextState = {
        results,
        loading: false,
        error: null,
        empty: results.length === 0,
      };
      setState(nextState);
    } catch (error) {
      setState({
        results: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar cidades.',
        empty: false,
      });
    } finally {
      inFlightQuery.current = null;
    }
  }, []);

  return useMemo(
    () => ({
      ...state,
      search,
    }),
    [search, state],
  );
}
