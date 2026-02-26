import { baseApi } from '../../../shared/api/baseApi.ts';
import type { LoginRequest, LoginResponse, User } from '../model/types.ts';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest & { rememberMe?: boolean }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: {
          username: credentials.username,
          password: credentials.password,
          expiresInMins: credentials.rememberMe ? 30 : 1,
        },
      }),
      transformResponse: (response: LoginResponse, _, arg) => {
        if (arg.rememberMe) {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
        } else {
          sessionStorage.setItem('accessToken', response.accessToken);
          sessionStorage.setItem('refreshToken', response.refreshToken);
        }

        return response;
      },
      invalidatesTags: ['Auth'],
    }),
    fetchUser: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
        }
      },
      invalidatesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useLazyFetchUserQuery } = authApi;
