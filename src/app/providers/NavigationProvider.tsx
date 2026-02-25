import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LoginPage, ProductsPage } from '../../pages';
import { Layout } from '../Layout.tsx';
import { ROUTES } from '../../shared/constants/routes.ts';

const protectedRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        index: true,
        path: ROUTES.PRODUCTS,
        element: <ProductsPage />,
      },
      {
        path: '*',
        element: <Navigate to={ROUTES.LOGIN} replace />,
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
  const isAuthenticated = localStorage.getItem('token');

  // return <RouterProvider router={protectedRouter} />;
  return <RouterProvider router={isAuthenticated ? protectedRouter : publicRouter} />;
};
