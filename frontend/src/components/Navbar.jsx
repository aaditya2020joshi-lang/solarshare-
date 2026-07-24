import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
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

  const links = (
    <>
      <Link to="/listings" onClick={closeMenu} className="hover:text-brand-100">
        Browse Listings
      </Link>
      <Link to="/learn" onClick={closeMenu} className="hover:text-brand-100">
        Learn
      </Link>

      {user?.role === 'seller' && (
        <>
          <Link to="/seller/listings" onClick={closeMenu} className="hover:text-brand-100">
            My Listings
          </Link>
          <Link to="/seller/requests" onClick={closeMenu} className="hover:text-brand-100">
            Requests
          </Link>
        </>
      )}

      {user?.role === 'buyer' && (
        <Link to="/buyer/requests" onClick={closeMenu} className="hover:text-brand-100">
          My Requests
        </Link>
      )}

      {user ? (
        <>
          <Link to="/dashboard" onClick={closeMenu} className="hover:text-brand-100">
            Dashboard
          </Link>
          <Link to="/profile" onClick={closeMenu} className="hover:text-brand-100">
            Profile
          </Link>
          {user.isAdmin && (
            <Link to="/admin" onClick={closeMenu} className="hover:text-brand-100">
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition text-left"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMenu} className="hover:text-brand-100">
            Log in
          </Link>
          <Link
            to="/signup"
            onClick={closeMenu}
            className="bg-white text-brand-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-50 transition text-center"
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-gradient-to-r from-brand-600 to-sky-accent text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="text-xl font-bold tracking-tight">
          ☀️ SolarShare
        </Link>

        <div className="hidden md:flex items-center gap-4 text-sm font-medium">{links}</div>

        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden p-2 -mr-2"
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

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm font-medium">{links}</div>
      )}
    </nav>
  );
}
