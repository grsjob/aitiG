import { baseApi } from '../../../shared/api/baseApi.ts';
import type { ProductsResponse } from '../model/types.ts';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, { limit?: number; skip?: number }>({
      query: ({ limit = 10, skip = 0 }) => ({
        url: '/products',
        method: 'GET',
        params: { limit, skip },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    searchProducts: builder.query<ProductsResponse, string>({
      query: (searchTerm) => ({
        url: '/products/search',
        method: 'GET',
        params: { q: searchTerm },
      }),
      providesTags: [{ type: 'Product', id: 'SEARCH' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProductsQuery, useSearchProductsQuery } = productsApi;
