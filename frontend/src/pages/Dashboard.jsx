import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';

const QUICK_LINKS = [
  { to: '/loans', icon: '💸', title: 'Loans', description: 'Apply for a Micro Loan.' },
  { to: '/insights', icon: '🤖', title: 'AI Insights', description: 'See personalized spending and saving insights.' },
  { to: '/support', icon: '🛟', title: 'Support', description: 'Report a failed or stuck payment.' },
];

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

      <div className="grid sm:grid-cols-3 gap-6">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 dark:from-brand-900/50 dark:to-sky-900/50 flex items-center justify-center text-2xl mb-4">
              {link.icon}
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{link.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-6">
        Balance, transfers, and cards are still coming soon to this demo.
      </p>
    </div>
  );
}
