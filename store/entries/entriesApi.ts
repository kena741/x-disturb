// store/api/entriesApi.ts
import { EntriesByLocationResponse, EntriesOverTimeResponse } from '@/types/entries';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const entriesApi = createApi({
  reducerPath: 'entriesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getEntriesOverTime: builder.query<EntriesOverTimeResponse, void>({
      query: () => ({
        url: 'getentriesovertime',
        method: 'GET',
      }),
    }),
    getEntriesByLocation: builder.query<EntriesByLocationResponse, void>({
      query: () => ({
        url: 'getentriesbylocation',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetEntriesOverTimeQuery,
  useGetEntriesByLocationQuery,
} = entriesApi;
