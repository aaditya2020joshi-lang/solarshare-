import { useState } from 'react';
import client from '../api/client';
import Spinner from '../components/Spinner';

function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.get('/orders/admin', {
        headers: { 'x-admin-password': password },
      });
      setOrders(data.orders);
      setStats(data.stats);
      setAuthed(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              required
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-semibold py-2.5 rounded-full transition-all disabled:opacity-60"
            >
              {loading ? 'Checking…' : 'View Orders'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Orders</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Paid Orders" value={stats.paid_orders} />
        <StatCard label="Units Sold" value={stats.units_sold} />
        <StatCard label="Total Revenue" value={`₹${stats.total_revenue.toLocaleString('en-IN')}`} />
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No orders yet.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Ship to</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{o.customer_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {o.email}
                    <div className="text-xs text-gray-400">{o.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {o.address}, {o.city} {o.pincode}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.quantity}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    ₹{Number(o.total_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        o.status === 'paid'
                          ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                    {new Date(o.created_at).toLocaleDateString()}
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
