import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState } from './types.ts';
import { authApi } from '../api/authApi.ts';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  rememberMe: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.rememberMe = false;
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

export const { setRememberMe, logout } = authSlice.actions;
export default authSlice.reducer;
