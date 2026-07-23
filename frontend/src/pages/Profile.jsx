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

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <p className="text-gray-900 capitalize">{user.role}</p>
        </div>

        {user.role === 'buyer' && (
          <label className="flex items-start gap-3 bg-brand-50 border border-brand-200 rounded-lg p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={communityPriority}
              onChange={(e) => setCommunityPriority(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-brand-700">Community Priority</span> — I'm
              from a low-income or underserved area.
            </span>
          </label>
        )}

        {status && (
          <p className={`text-sm ${status.ok ? 'text-brand-700' : 'text-red-600'}`}>
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
