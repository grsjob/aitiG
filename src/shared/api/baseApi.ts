import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery.ts';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({
    baseUrl: '/api',
  }),
  endpoints: () => ({}),
  tagTypes: ['Product', 'Auth'],
});
