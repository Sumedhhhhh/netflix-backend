import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { login, signup } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import type { AuthCredentials } from '../api/types';

export function useLogin() {
  const { setToken } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => login(credentials),
    onSuccess: (data) => {
      setToken(data.access_token);
      router.navigate({ to: '/browse' });
    },
  });
}

export function useSignup() {
  const { setToken } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => signup(credentials),
    onSuccess: (data) => {
      setToken(data.access_token);
      router.navigate({ to: '/browse' });
    },
  });
}
