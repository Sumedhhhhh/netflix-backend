import { useState } from 'react';
import { useLogin, useSignup } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type AuthMode = 'login' | 'signup';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const mutation = mode === 'login' ? loginMutation : signupMutation;
  const isLoading = mutation.isPending;
  const serverError = mutation.isError
    ? (() => {
        const err = mutation.error;
        if (err && typeof err === 'object' && 'message' in err) {
          return (err as Error).message || 'An error occurred. Please try again.';
        }
        return 'An error occurred. Please try again.';
      })()
    : null;

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ email, password });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setFieldErrors({});
    mutation.reset();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-netflix-bg">
      {/* Full-bleed cinematic background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/9134db96-10d6-4a64-a619-a21da22f8999/a449faea-1c7a-4f89-b1c3-e3e37a013c7f/IN-en-20240205-popsignuptwoweeks-perspective_alpha_website_large.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
      </div>

      {/* Navbar-like top bar */}
      <div className="absolute top-0 left-0 right-0 px-8 md:px-12 py-5 flex items-center justify-between z-10">
        {/* Netflix Logo */}
        <svg
          viewBox="0 0 111 30"
          className="h-8 fill-netflix-red"
          aria-label="Netflix"
        >
          <path d="M105.06233,14.2806261 L110.999999,27.5752861 C109.249999,27.3752851 107.500004,27.1252851 105.75,26.8752851 L102.37568,19.5757161 L98.8432526,26.4058971 C97.1932526,26.1308971 95.5932526,25.8808971 93.9932526,25.6808971 L99.9543526,14.022513 L94.4313526,0.0395261 L99.4943526,0.0395261 L102.811686,7.61567861 L106.129019,0.0395261 L111,0.0395261 L105.06233,14.2806261 Z M90.4686785,27.0015951 C88.6886785,26.7515951 86.8886785,26.5515951 85.0886785,26.4015951 L85.0886785,0.0395261 L90.4686785,0.0395261 L90.4686785,27.0015951 Z M82.0460714,0.0395261 L76.6660714,0.0395261 L76.6660714,23.7925951 C78.3660714,23.8925951 80.0660714,24.0425951 82.0460714,24.3425951 L82.0460714,0.0395261 Z M69.4045071,0.0395261 L64.0245071,0.0395261 L64.0245071,22.5095961 C65.7245071,22.5095961 67.5745071,22.5595961 69.4045071,22.6595961 L69.4045071,0.0395261 Z M60.1249416,0.0395261 L54.7449416,0.0395261 L54.7449416,22.0895961 C56.3749416,22.0095961 58.2249416,21.9595961 60.1249416,21.9595961 L60.1249416,0.0395261 Z M45.7108327,0.0395261 L40.3308327,0.0395261 L40.3308327,25.6558971 C42.0308327,25.9308971 43.8308327,26.1808971 45.7108327,26.4308971 L45.7108327,0.0395261 Z M30.5265868,0.0395261 L30.5265868,28.4315951 C32.2265868,28.6815951 34.0265868,28.9315951 35.9065868,29.1315951 L35.9065868,0.0395261 L30.5265868,0.0395261 Z M15.2110479,0.0395261 L20.5910479,0.0395261 L20.5910479,27.0015951 C18.8410479,26.7515951 17.0910479,26.5515951 15.2110479,26.4015951 L15.2110479,0.0395261 Z M0.0,0.0395261 L5.50002497,0.0395261 L5.50002497,27.0015951 C3.79999988,26.7515951 1.95000005,26.5515951 0.0,26.4015951 L0.0,0.0395261 Z" />
        </svg>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-black/80 rounded-md px-8 py-10 md:px-12 backdrop-blur-sm">
          <h1 className="text-white text-3xl font-bold mb-8">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server error */}
            {serverError && (
              <div className="bg-netflix-red/20 border border-netflix-red/50 rounded px-4 py-3">
                <p className="text-red-300 text-sm">{serverError}</p>
              </div>
            )}

            <Input
              type="email"
              label="Email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              autoComplete="email"
              disabled={isLoading}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-6 text-base"
            >
              {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-8 text-center">
            <span className="text-netflix-gray-mid text-sm">
              {mode === 'login' ? 'New to Netflix? ' : 'Already have an account? '}
            </span>
            <button
              onClick={toggleMode}
              className="text-white text-sm font-semibold hover:underline"
              type="button"
            >
              {mode === 'login' ? 'Sign up now.' : 'Sign in.'}
            </button>
          </div>

          <p className="text-netflix-gray-mid text-xs mt-6">
            This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-8 md:px-12 py-8 z-10">
        <hr className="border-netflix-gray-dark mb-6" />
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {['FAQ', 'Help Center', 'Terms of Use', 'Privacy', 'Cookie Preferences', 'Corporate Information'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-netflix-gray-mid text-xs hover:underline"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
