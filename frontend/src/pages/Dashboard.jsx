import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/dashboard').then(({ data }) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Spinner label="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome, {data.user.name}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Ask a question any time and get a clear answer back.
      </p>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Head to the homepage to ask a question, or use the help chat in the corner of any page.
        </p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-6 py-2.5 rounded-full hover:shadow-md transition-all"
        >
          Ask a question
        </Link>
      </div>
    </div>
  );
}
