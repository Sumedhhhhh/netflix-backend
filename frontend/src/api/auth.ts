import ky from 'ky';
import type { AuthCredentials, AuthResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL as string;

// Auth endpoints use plain ky (no auth header needed)
const authClient = ky.create({
  prefixUrl: API_URL,
  timeout: 15000,
});

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  return authClient.post('auth/login', { json: credentials }).json<AuthResponse>();
}

export async function signup(credentials: AuthCredentials): Promise<AuthResponse> {
  return authClient.post('auth/signup', { json: credentials }).json<AuthResponse>();
}
