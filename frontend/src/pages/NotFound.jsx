import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-7xl font-bold text-brand-600 dark:text-brand-400 mb-4">404</p>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        This page doesn't exist — it may have moved, or the link might be off.
      </p>
      <Link
        to="/"
        className="inline-block bg-gray-900 dark:bg-brand-600 text-white font-bold px-7 py-3 rounded-lg hover:bg-brand-600 dark:hover:bg-brand-500 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
