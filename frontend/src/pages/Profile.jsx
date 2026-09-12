import { useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location || '');
  const [communityPriority, setCommunityPriority] = useState(user.communityPriority);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const { data } = await client.put('/users/me', { name, location, communityPriority });
      updateUser(data);
      setStatus({ ok: true, message: 'Profile updated.' });
    } catch (err) {
      setStatus({ ok: false, message: err.response?.data?.error || 'Could not update profile' });
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input
              placeholder="e.g. Pune, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <p className="text-gray-900 dark:text-white capitalize">{user.role}</p>
          </div>

          {user.role === 'buyer' && (
            <label className="flex items-start gap-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-lg p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={communityPriority}
                onChange={(e) => setCommunityPriority(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-brand-700 dark:text-brand-400">Community Priority</span> — I'm
                from a low-income or underserved area.
              </span>
            </label>
          )}

          {status && (
            <p className={`text-sm ${status.ok ? 'text-brand-700 dark:text-brand-400' : 'text-red-600 dark:text-red-400'}`}>
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-semibold py-2.5 rounded-full transition-all disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
