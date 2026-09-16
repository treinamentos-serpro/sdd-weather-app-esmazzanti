import { normalizeSearchText } from '../lib/validation';
import type { GeocodingApiResponse } from '../types/api';
import type { City } from '../types/weather';
import { requestJson } from './apiClient';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function searchCities(query: string): Promise<City[]> {
  const normalized = normalizeSearchText(query);
  const params = new URLSearchParams({
    name: normalized,
    language: 'pt',
    count: '10',
    format: 'json',
  });
  const url = `${GEOCODING_URL}?${params.toString().replace(/\+/g, '%20')}`;

  const payload = await requestJson<GeocodingApiResponse>(url, {
    timeoutMs: 8000,
  });

  const results = payload.results ?? [];

  return results
    .filter(
      (item) =>
        item.id != null &&
        isFiniteNumber(item.latitude) &&
        isFiniteNumber(item.longitude) &&
        typeof item.name === 'string' &&
        item.name.length > 0,
    )
    .map((item) => ({
      id: Number(item.id),
      name: item.name ?? 'Indisponível',
      country: item.country ?? null,
      admin1: item.admin1 ?? null,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
    }))
    .slice(0, 10);
}
