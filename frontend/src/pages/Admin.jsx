import { useEffect, useState } from 'react';
import client from '../api/client';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';

function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [statsRes, usersRes, listingsRes, transactionsRes] = await Promise.all([
        client.get('/admin/stats'),
        client.get('/admin/users'),
        client.get('/admin/listings'),
        client.get('/admin/recent-transactions'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setListings(listingsRes.data);
      setTransactions(transactionsRes.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Spinner label="Loading admin data…" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin</h1>

      <div className="bg-gradient-to-r from-brand-600 to-sky-accent rounded-2xl p-6 mb-6 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-xs font-semibold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE · Razorpay
          </span>
          <p className="text-sm text-white/80">Platform Revenue</p>
        </div>
        <p className="text-4xl sm:text-5xl font-bold mb-4">₹{stats.panelOrders.platform_revenue.toFixed(2)}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20 text-sm">
          <div>
            <p className="text-white/70 text-xs mb-0.5">Transactions</p>
            <p className="font-semibold text-lg">{stats.panelOrders.completed}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-0.5">Sales Volume</p>
            <p className="font-semibold text-lg">₹{stats.panelOrders.total_value.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-0.5">Avg Order Value</p>
            <p className="font-semibold text-lg">₹{stats.panelOrders.avg_order_value.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-0.5">Flat Fee / Order</p>
            <p className="font-semibold text-lg">₹49</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.users.total} />
        <StatCard label="Sellers" value={stats.users.sellers} />
        <StatCard label="Buyers" value={stats.users.buyers} />
        <StatCard label="Priority Buyers" value={stats.users.priority_buyers} />
        <StatCard label="Active Listings" value={stats.listings.active} />
        <StatCard
          label="Energy Traded"
          value={`₹${stats.transactions.total_value.toFixed(2)}`}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No completed transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-2 font-medium">Buyer</th>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Platform Fee</th>
                  <th className="px-4 py-2 font-medium">Razorpay Payment ID</th>
                  <th className="px-4 py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-gray-900 dark:text-white font-medium">{t.buyer_name}</td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                      {t.panel_name} <span className="text-gray-400 dark:text-gray-500">· {t.vendor_name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-white">
                      ₹{Number(t.total_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-brand-600 dark:text-brand-400 font-medium">
                      ₹{Number(t.platform_fee).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500 font-mono text-xs">
                      {t.razorpay_payment_id}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500">
                      {new Date(t.paid_claimed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'users'
              ? 'bg-gradient-to-r from-brand-600 to-sky-accent text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab('listings')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'listings'
              ? 'bg-gradient-to-r from-brand-600 to-sky-accent text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Listings ({listings.length})
        </button>
      </div>

      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
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
                <tr
                  key={u.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name} size="w-6 h-6" />
                      {u.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.location || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {u.community_priority ? '⭐ Yes' : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'listings' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
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
                <tr
                  key={l.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar name={l.seller_name} size="w-6 h-6" />
                      <div>
                        {l.seller_name}
                        <div className="text-gray-400 dark:text-gray-500 text-xs font-normal">
                          {l.seller_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{l.location}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {Number(l.kwh_available).toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    ₹{Number(l.standard_price).toFixed(2)}
                    {l.community_price !== null && (
                      <span className="text-brand-600 dark:text-brand-400">
                        {' '}
                        / ₹{Number(l.community_price).toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        l.status === 'active'
                          ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
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
