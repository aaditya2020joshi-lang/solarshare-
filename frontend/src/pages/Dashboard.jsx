import { useEffect, useState } from 'react';
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
        Your Sahara Bank account dashboard — balances, statements, and transfers land here.
      </p>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Full account features (balance, transfers, cards, loans) are coming soon to this demo.
        </p>
      </div>
    </div>
  );
}
