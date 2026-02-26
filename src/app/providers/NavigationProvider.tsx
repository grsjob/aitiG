import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LoginPage, ProductsPage } from '../../pages';
import { Layout } from '../Layout.tsx';
import { ROUTES } from '../../shared/constants/routes.ts';
import { useAppSelector, useAppDispatch } from '../store';
import { useEffect } from 'react';
import { setUser } from '../../features/auth/model/authSlice.ts';
import { useLazyFetchUserQuery } from '../../features/auth/api/authApi.ts';

const protectedRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        path: ROUTES.PRODUCTS,
        element: <ProductsPage />,
      },
      {
        path: '*',
        element: <Navigate to={ROUTES.PRODUCTS} replace />,
      },
    ],
  },
]);

const publicRouter = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
]);

export const NavigationProvider = () => {
  const dispatch = useAppDispatch();
  const [fetchUser, { data: userData, isSuccess, isError }] = useLazyFetchUserQuery();
  const authState = useAppSelector((state: any) => state.auth);
  const hasTokens = !!(
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  );

  const isAuthenticated = !!(hasTokens && authState.user);

  useEffect(() => {
    if (hasTokens && !authState.user && !isError) {
      fetchUser();
    }
  }, [fetchUser, hasTokens, authState.user, isError]);

  useEffect(() => {
    if (isError) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
  }, [isError]);

  useEffect(() => {
    console.log('fetchUser result:', { isSuccess, userData, isError });
    if (isSuccess && userData) {
      console.log('Dispatching setUser with:', userData);
      dispatch(setUser(userData));
    }
  }, [isSuccess, userData, isError, dispatch]);

  useEffect(() => {
    if (isError) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
  }, [isError]);

  return <RouterProvider router={isAuthenticated ? protectedRouter : publicRouter} />;
};
