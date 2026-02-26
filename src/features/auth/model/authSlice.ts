import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './types.ts';
import { authApi } from '../api/authApi.ts';

const getInitialState = (): AuthState => {
  const localStorageToken = localStorage.getItem('accessToken');
  const sessionStorageToken = sessionStorage.getItem('accessToken');

  if (localStorageToken || sessionStorageToken) {
    return {
      user: null,
      isLoading: false,
      error: null,
      rememberMe: !!localStorageToken,
    };
  }

  return {
    user: null,
    isLoading: false,
    error: null,
    rememberMe: false,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          gender: payload.gender,
          image: payload.image,
        };
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || 'Login failed';
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
