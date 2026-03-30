import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JwtPayload } from '../api/types';

interface AuthState {
  token: string | null;
  userId: string | null;
  setToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isTokenExpired: () => boolean;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,

      setToken: (token: string) => {
        const payload = decodeJwtPayload(token);
        set({
          token,
          userId: payload?.sub ?? null,
        });
      },

      clearAuth: () => {
        set({ token: null, userId: null });
      },

      isTokenExpired: (): boolean => {
        const { token } = get();
        if (!token) return true;
        const payload = decodeJwtPayload(token);
        if (!payload) return true;
        const nowSeconds = Math.floor(Date.now() / 1000);
        return payload.exp < nowSeconds;
      },

      isAuthenticated: (): boolean => {
        const { token } = get();
        if (!token) return false;
        return !get().isTokenExpired();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
      }),
    }
  )
);
