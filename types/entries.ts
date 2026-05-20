// types/analytics.ts
export interface TrendDataItem {
  date: string;
  count: number;
}

export interface EntriesOverTimeResponse {
  trendData: TrendDataItem[];
  percentageChangeVsLastWeek: number;
  currentWeekTotal: number;
  previousWeekTotal: number;
}

export interface RegionDataItem {
  region: string;
  count: number;
}

export interface EntriesByLocationResponse {
  regionData: RegionDataItem[];
}
