import { useEffect, useState } from 'react';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { CheckIcon, TrashIcon } from '../components/icons';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  function load() {
    return client.get('/admin/users').then((res) => setUsers(res.data.users));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function withBusy(id, fn) {
    setBusyId(id);
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  }

  const handleApprove = (id) => withBusy(id, () => client.post(`/admin/users/${id}/approve`));
  const handleRevoke = (id) => withBusy(id, () => client.post(`/admin/users/${id}/revoke`));
  const handleDelete = (id) => {
    if (!confirm('Permanently delete this account and all its data?')) return;
    withBusy(id, () => client.delete(`/admin/users/${id}`));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const pending = users.filter((u) => !u.approved);
  const approved = users.filter((u) => u.approved);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">Admin — Accounts</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Pending approval ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <p className="text-sm text-gray-500 mb-8">No accounts waiting for approval.</p>
      ) : (
        <ul className="flex flex-col gap-3 mb-8">
          {pending.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                <div className="text-xs text-gray-500">
                  {u.email} · requested {formatDateTime(u.created_at)}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(u.id)}
                  disabled={busyId === u.id}
                  className="flex items-center gap-1 bg-gradient-to-r from-brand-600 to-sky-accent text-white text-sm font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  <CheckIcon className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={busyId === u.id}
                  aria-label="Delete account"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Approved accounts ({approved.length})
      </h2>
      <ul className="flex flex-col gap-3">
        {approved.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                {u.name}
                {u.role === 'admin' && (
                  <span className="text-[10px] uppercase tracking-wide bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </div>
            {u.role !== 'admin' && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleRevoke(u.id)}
                  disabled={busyId === u.id}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-60"
                >
                  Revoke
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={busyId === u.id}
                  aria-label="Delete account"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
