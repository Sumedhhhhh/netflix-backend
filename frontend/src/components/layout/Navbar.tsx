import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Bell, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!transparent) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  const handleLogout = () => {
    clearAuth();
    navigate({ to: '/auth' });
  };

  const bgClass = transparent
    ? scrolled
      ? 'bg-netflix-bg'
      : 'bg-transparent bg-gradient-to-b from-black/70 to-transparent'
    : 'bg-netflix-bg';

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-in-out
        ${bgClass}
      `}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-8">
          {/* Netflix Logo */}
          <Link to="/browse" className="flex-shrink-0">
            <svg
              viewBox="0 0 111 30"
              className="h-6 md:h-8 fill-netflix-red"
              aria-label="Netflix"
            >
              <path d="M105.06233,14.2806261 L110.999999,27.5752861 C109.249999,27.3752851 107.500004,27.1252851 105.75,26.8752851 L102.37568,19.5757161 L98.8432526,26.4058971 C97.1932526,26.1308971 95.5932526,25.8808971 93.9932526,25.6808971 L99.9543526,14.022513 L94.4313526,0.0395261 L99.4943526,0.0395261 L102.811686,7.61567861 L106.129019,0.0395261 L111,0.0395261 L105.06233,14.2806261 Z M90.4686785,27.0015951 C88.6886785,26.7515951 86.8886785,26.5515951 85.0886785,26.4015951 L85.0886785,0.0395261 L90.4686785,0.0395261 L90.4686785,27.0015951 Z M82.0460714,0.0395261 L76.6660714,0.0395261 L76.6660714,23.7925951 C78.3660714,23.8925951 80.0660714,24.0425951 82.0460714,24.3425951 L82.0460714,0.0395261 Z M69.4045071,0.0395261 L64.0245071,0.0395261 L64.0245071,22.5095961 C65.7245071,22.5095961 67.5745071,22.5595961 69.4045071,22.6595961 L69.4045071,0.0395261 Z M60.1249416,0.0395261 L54.7449416,0.0395261 L54.7449416,22.0895961 C56.3749416,22.0095961 58.2249416,21.9595961 60.1249416,21.9595961 L60.1249416,0.0395261 Z M45.7108327,0.0395261 L40.3308327,0.0395261 L40.3308327,25.6558971 C42.0308327,25.9308971 43.8308327,26.1808971 45.7108327,26.4308971 L45.7108327,0.0395261 Z M30.5265868,0.0395261 L30.5265868,28.4315951 C32.2265868,28.6815951 34.0265868,28.9315951 35.9065868,29.1315951 L35.9065868,0.0395261 L30.5265868,0.0395261 Z M15.2110479,0.0395261 L20.5910479,0.0395261 L20.5910479,27.0015951 C18.8410479,26.7515951 17.0910479,26.5515951 15.2110479,26.4015951 L15.2110479,0.0395261 Z M0.0,0.0395261 L5.50002497,0.0395261 L5.50002497,27.0015951 C3.79999988,26.7515951 1.95000005,26.5515951 0.0,26.4015951 L0.0,0.0395261 Z" />
            </svg>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/browse"
              className="text-white text-sm hover:text-netflix-gray-light transition-colors"
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="text-netflix-gray-light text-sm hover:text-white transition-colors"
            >
              Movies
            </Link>
            <Link
              to="/browse"
              className="text-netflix-gray-light text-sm hover:text-white transition-colors"
            >
              TV Shows
            </Link>
            <Link
              to="/admin"
              className="text-netflix-gray-light text-sm hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Right: Icons + User Menu */}
        <div className="flex items-center gap-4">
          <button className="text-white hover:text-netflix-gray-light transition-colors">
            <Search size={20} />
          </button>
          <button className="text-white hover:text-netflix-gray-light transition-colors">
            <Bell size={20} />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 group"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center text-white font-bold text-sm">
                U
              </div>
              <ChevronDown
                size={16}
                className={`text-white transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div
                className="
                  absolute right-0 top-full mt-2
                  w-48 bg-netflix-bg-secondary
                  border border-netflix-gray-dark/50 rounded
                  shadow-2xl z-50
                  animate-fadeIn
                "
              >
                <div className="py-1">
                  <Link
                    to="/browse"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-netflix-gray-light hover:text-white transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-netflix-gray-light hover:text-white transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Admin
                  </Link>
                  <hr className="border-netflix-gray-dark my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-netflix-gray-light hover:text-white transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
