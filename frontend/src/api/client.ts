import ky, { type BeforeRequestHook, type AfterResponseHook, type KyInstance } from 'ky';

const API_URL = import.meta.env.VITE_API_URL as string;

// Lazy import to avoid circular dependency with store
function getToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function redirectToAuth(): void {
  window.location.href = '/auth';
}

const beforeRequest: BeforeRequestHook = (request) => {
  const token = getToken();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
};

const afterResponse: AfterResponseHook = async (_request, _options, response) => {
  if (response.status === 401) {
    localStorage.removeItem('auth-storage');
    redirectToAuth();
  }
  return response;
};

export const apiClient: KyInstance = ky.create({
  prefixUrl: API_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [beforeRequest],
    afterResponse: [afterResponse],
  },
});

export default apiClient;
