import { Link } from 'react-router-dom';
import Sun from '../components/Sun';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <Sun className="w-20 h-20 mx-auto mb-6 animate-sun-pulse" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        This page doesn't exist — it may have moved, or the link might be off.
      </p>
      <Link
        to="/"
        className="inline-block bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-7 py-3 rounded-full shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        Back to home
      </Link>
    </div>
  );
}
