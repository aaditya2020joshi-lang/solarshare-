import { useEffect, useState } from 'react';
import client from '../api/client';

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [statsRes, usersRes, listingsRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/users'),
        client.get('/admin/listings'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setListings(listingsRes.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="max-w-6xl mx-auto px-4 py-10 text-gray-500">Loading…</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin</h1>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.users.total} />
        <StatCard label="Sellers" value={stats.users.sellers} />
        <StatCard label="Buyers" value={stats.users.buyers} />
        <StatCard label="Priority Buyers" value={stats.users.priority_buyers} />
        <StatCard label="Active Listings" value={stats.listings.active} />
        <StatCard
          label="Total Traded"
          value={`₹${stats.transactions.total_value.toFixed(2)}`}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
            tab === 'users' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab('listings')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
            tab === 'listings' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Listings ({listings.length})
        </button>
      </div>

      {tab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-900 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-gray-600">{u.location || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {u.community_priority ? '⭐ Yes' : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'listings' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">kWh Available</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {l.seller_name}
                    <div className="text-gray-400 text-xs">{l.seller_email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{l.location}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {Number(l.kwh_available).toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ₹{Number(l.standard_price).toFixed(2)}
                    {l.community_price !== null && (
                      <span className="text-brand-600"> / ₹{Number(l.community_price).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        l.status === 'active'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
