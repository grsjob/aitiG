import { baseApi } from '../../../shared/api/baseApi.ts';
import type { LoginRequest, LoginResponse } from '../model/types.ts';

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
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
