import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { AuthPage } from './pages/AuthPage';
import { BrowsePage } from './pages/BrowsePage';
import { WatchPage } from './pages/WatchPage';
import { AdminPage } from './pages/AdminPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Helper to get auth state outside of React
function isLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    const token = parsed?.state?.token;
    if (!token) return false;

    // Check expiry
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp: number };
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Index route — redirects based on auth state
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (isLoggedIn()) {
      throw redirect({ to: '/browse' });
    } else {
      throw redirect({ to: '/auth' });
    }
  },
  component: () => null,
});

// Auth route
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: () => {
    if (isLoggedIn()) {
      throw redirect({ to: '/browse' });
    }
  },
  component: AuthPage,
});

// Browse route
const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: () => (
    <ProtectedRoute>
      <BrowsePage />
    </ProtectedRoute>
  ),
});

// Watch route
const watchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watch/$videoId',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      resume: search.resume === true || search.resume === 'true',
    };
  },
  component: () => (
    <ProtectedRoute>
      <WatchPage />
    </ProtectedRoute>
  ),
});

// Admin route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  ),
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  browseRoute,
  watchRoute,
  adminRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
