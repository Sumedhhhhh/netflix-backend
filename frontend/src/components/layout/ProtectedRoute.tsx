import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { FullPageSpinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isTokenExpired } = useAuthStore();
  const navigate = useNavigate();

  const authenticated = isAuthenticated();
  const expired = isTokenExpired();

  useEffect(() => {
    if (!authenticated || expired) {
      navigate({ to: '/auth', replace: true });
    }
  }, [authenticated, expired, navigate]);

  if (!authenticated || expired) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
