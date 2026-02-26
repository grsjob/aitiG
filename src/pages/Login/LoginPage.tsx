import { Login } from '../../features/auth/ui/Login.tsx';
import { ROUTES } from '../../shared/constants/routes.ts';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import { useEffect } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state: any) => !!state.auth.user);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.PRODUCTS);
    }
  }, [isAuthenticated, navigate]);

  return <Login />;
};
