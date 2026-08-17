import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function SunIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const linkClass =
    'relative text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors';

  const links = (
    <>
      {user ? (
        <>
          <Link to="/dashboard" onClick={closeMenu} className={linkClass}>
            Dashboard
          </Link>
          <Link to="/loans" onClick={closeMenu} className={linkClass}>
            Loans
          </Link>
          <Link to="/insights" onClick={closeMenu} className={linkClass}>
            AI Insights
          </Link>
          <Link to="/support" onClick={closeMenu} className={linkClass}>
            Support
          </Link>
          <Link to="/profile" onClick={closeMenu} className={linkClass}>
            Profile
          </Link>
          {user.isAdmin && (
            <Link to="/admin" onClick={closeMenu} className={linkClass}>
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-full transition-colors text-left"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link to="/loans" onClick={closeMenu} className={linkClass}>
            Loans
          </Link>
          <Link to="/login" onClick={closeMenu} className={linkClass}>
            Log in
          </Link>
          <Link
            to="/signup"
            onClick={closeMenu}
            className="bg-gradient-to-r from-brand-600 to-sky-accent text-white px-4 py-1.5 rounded-full font-semibold shadow-sm hover:shadow-md hover:-translate-y-px transition-all text-center"
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-sky-accent bg-clip-text text-transparent"
        >
          🏦 Sahara Bank
        </Link>

        <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          {links}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-gray-500 dark:text-gray-300"
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2 -mr-2 text-gray-700 dark:text-gray-200"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm font-medium bg-white dark:bg-gray-900">
          {links}
        </div>
      )}
    </nav>
  );
}
