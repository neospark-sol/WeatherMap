export type Location = {
  id: string;
  name: string;
  state: string;
  /** ISO 3166-1 alpha-2 */
  country: string;
  postcode?: string;
  lat: number;
  lon: number;
  timezone: string;
};
export type CurrentConditions = {
  observedAt: string;
  temperatureC: number;
  feelsLikeC?: number;
  humidityPct?: number;
  windKph?: number;
  windGustKph?: number;
  windDir?: string;
  pressureHpa?: number;
  uvIndex?: number;
  conditionCode: string;
  conditionLabel: string;
  icon: string;
};
export type HourPoint = {
  time: string;
  tempC: number;
  rainProbabilityPct?: number;
  precipMm?: number;
  windKph?: number;
  windGustKph?: number;
  humidityPct?: number;
  conditionCode?: string;
};
export type DailyPoint = {
  date: string;
  minC: number;
  maxC: number;
  rainProbabilityPct?: number;
  precipMm?: number;
  windKph?: number;
  conditionCode: string;
  conditionLabel: string;
  icon: string;
};
export type WarningItem = {
  id: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  summary: string;
  issuedAt: string;
  expiresAt?: string | null;
  areas: string[];
  source: string;
  url?: string;
};
