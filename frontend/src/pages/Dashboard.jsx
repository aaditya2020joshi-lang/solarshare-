import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
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

  if (loading) return <p className="max-w-5xl mx-auto px-4 py-10 text-gray-500">Loading…</p>;

  const isSeller = user.role === 'seller';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isSeller ? 'Seller Dashboard' : 'Buyer Dashboard'}
      </h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {isSeller ? (
          <>
            <StatCard label="Total kWh Sold" value={data.totalKwhSold.toFixed(1)} />
            <StatCard label="Total Earnings" value={`$${data.totalEarnings.toFixed(2)}`} />
            <StatCard label="Completed Sales" value={data.transactions.length} />
          </>
        ) : (
          <>
            <StatCard label="Total kWh Bought" value={data.totalKwhBought.toFixed(1)} />
            <StatCard label="Total Spending" value={`$${data.totalSpending.toFixed(2)}`} />
            <StatCard
              label="Saved via Community Pricing"
              value={`$${data.totalSavings.toFixed(2)}`}
            />
          </>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Transaction History</h2>
      {data.transactions.length === 0 ? (
        <p className="text-gray-500">No completed transactions yet.</p>
      ) : (
        <div className="space-y-2">
          {data.transactions.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {isSeller ? t.buyer_name : t.seller_name} · {t.location}
                </p>
                <p className="text-gray-500">
                  {Number(t.kwh_requested).toFixed(1)} kWh at ${Number(t.price_applied).toFixed(2)}
                  /kWh
                  {t.is_priority && (
                    <span className="ml-2 text-brand-600 font-medium">Community rate</span>
                  )}
                </p>
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
