export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  time: string | null;
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  weatherLabel: string;
  weatherIcon: string;
  unit: Unit;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  weatherLabel: string;
  weatherIcon: string;
  temperatureMin: number | null;
  temperatureMax: number | null;
  precipitationProbability: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: string;
  isStale: boolean;
  staleReason?: string;
}
