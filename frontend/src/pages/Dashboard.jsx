import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import BarChart from '../components/BarChart';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { BoltIcon, RupeeIcon, InboxIcon } from '../components/icons';

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 transition-shadow hover:shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function groupByDay(transactions, valueFn) {
  const byDate = new Map();
  transactions.forEach((t) => {
    const date = new Date(t.responded_at);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!byDate.has(key)) byDate.set(key, { key, label, value: 0 });
    byDate.get(key).value += valueFn(t);
  });
  return Array.from(byDate.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const endpoint = user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer';
      const { data } = await client.get(endpoint);
      setData(data);
      setLoading(false);
    }
    load();
  }, [user.role]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Spinner label="Loading dashboard…" />
      </div>
    );
  }

  const isSeller = user.role === 'seller';
  const moneyChartData = groupByDay(
    data.transactions,
    (t) => Number(t.kwh_requested) * Number(t.price_applied)
  );
  const kwhChartData = groupByDay(data.transactions, (t) => Number(t.kwh_requested));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isSeller ? 'Seller Dashboard' : 'Buyer Dashboard'}
      </h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {isSeller ? (
          <>
            <StatCard
              label="Total kWh Sold"
              value={data.totalKwhSold.toFixed(1)}
              icon={<BoltIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Total Earnings"
              value={`₹${data.totalEarnings.toFixed(2)}`}
              icon={<RupeeIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Completed Sales"
              value={data.transactions.length}
              icon={<InboxIcon className="w-5 h-5" />}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total kWh Bought"
              value={data.totalKwhBought.toFixed(1)}
              icon={<BoltIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Total Spending"
              value={`₹${data.totalSpending.toFixed(2)}`}
              icon={<RupeeIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Saved via Community Pricing"
              value={`₹${data.totalSavings.toFixed(2)}`}
              icon={<span className="text-lg">⭐</span>}
            />
          </>
        )}
      </div>

      {moneyChartData.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {isSeller ? 'Earnings over time' : 'Spending over time'}
            </h2>
            <BarChart data={moneyChartData} formatValue={(v) => `₹${v.toFixed(0)}`} />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {isSeller ? 'kWh sold over time' : 'kWh bought over time'}
            </h2>
            <BarChart data={kwhChartData} formatValue={(v) => `${v.toFixed(1)}`} />
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Transaction History</h2>
      {data.transactions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <InboxIcon className="w-10 h-10 mx-auto mb-3" />
          <p>No completed transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.transactions.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Avatar name={isSeller ? t.buyer_name : t.seller_name} size="w-8 h-8" />
                <div>
                  <p className="font-medium text-gray-900">
                    {isSeller ? t.buyer_name : t.seller_name} · {t.location}
                  </p>
                  <p className="text-gray-500 flex items-center gap-1">
                    <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                    {Number(t.kwh_requested).toFixed(1)} kWh at ₹{Number(t.price_applied).toFixed(2)}
                    /kWh
                    {t.is_priority && (
                      <span className="ml-1 text-brand-600 font-medium">Community rate</span>
                    )}
                  </p>
                </div>
              </div>
              <span className="text-gray-400">
                {new Date(t.responded_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
