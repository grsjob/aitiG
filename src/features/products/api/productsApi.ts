import { baseApi } from '../../../shared/api/baseApi.ts';
import type { Product, ProductsResponse } from '../model/types.ts';

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

    getProductById: builder.query<Product, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      providesTags: (_, __, id) => [{ type: 'Product', id }],
    }),

    searchProducts: builder.query<ProductsResponse, string>({
      query: (searchTerm) => ({
        url: '/products/search',
        method: 'GET',
        params: { q: searchTerm },
      }),
      providesTags: [{ type: 'Product', id: 'SEARCH' }],
    }),

    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (product) => ({
        url: '/products/add',
        method: 'POST',
        data: product,
      }),
      invalidatesTags: ['Product'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useSearchProductsQuery,
  useAddProductMutation,
} = productsApi;
