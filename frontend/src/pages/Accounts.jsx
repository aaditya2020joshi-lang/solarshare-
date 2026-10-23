import { useEffect, useState } from 'react';
import client from '../api/client';
import Spinner from '../components/Spinner';

function hm(seconds) {
  const m = Math.round(seconds / 60);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
}

function ago(iso) {
  if (!iso) return 'Never';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Accounts() {
  const [accounts, setAccounts] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    client.get('/accounts').then((res) => {
      setAccounts(res.data.accounts);
      setMe(res.data.me);
    });
  }, []);

  if (!accounts) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">Accounts</h1>
      <p className="text-sm text-gray-500 mb-6">Everyone using StudyHub and how they are doing.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                  {a.name}
                  {a.id === me ? ' (you)' : ''}
                </div>
                {a.email && <div className="text-xs text-gray-500 truncate">{a.email}</div>}
              </div>
              <span
                className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium ${
                  a.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${a.online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                {a.online ? 'Online' : `Last seen ${ago(a.last_seen)}`}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Today</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{a.today_seconds ? hm(a.today_seconds) : 'Not Opened'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Total time</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{hm(a.total_seconds)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Tests taken</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{a.tests_taken}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Average score</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{a.avg_score == null ? '—' : `${a.avg_score}%`}</dd>
              </div>
            </dl>
            <div className="text-xs text-gray-500 mt-3">
              Member since{' '}
              {new Date(a.joined).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              {a.role === 'admin' ? ' · Admin' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
