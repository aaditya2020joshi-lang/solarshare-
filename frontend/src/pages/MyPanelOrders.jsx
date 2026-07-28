import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { InboxIcon, BoltIcon } from '../components/icons';

const statusStyles = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
  emi_active: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  payment_claimed: 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300',
};

const statusLabels = {
  pending: 'Awaiting payment',
  emi_active: 'EMI in progress',
  payment_claimed: 'Payment verified',
};

export default function MyPanelOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/panel-orders/mine').then(({ data }) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Panel Orders</h1>

      {loading ? (
        <Spinner label="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <InboxIcon className="w-10 h-10 mx-auto mb-3" />
          <p>No panel orders yet.</p>
          <Link to="/panels" className="text-brand-600 dark:text-brand-400 hover:underline text-sm">
            Browse the marketplace →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{o.panel_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[o.status]}`}>
                    {statusLabels[o.status]}
                  </span>
                  {o.payment_plan === 'emi' && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
                      EMI · {o.emi_months} months
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                  {o.quantity} × {o.wattage}W ({o.panel_type}) from {o.vendor_name} — ₹
                  {Number(o.total_amount).toLocaleString('en-IN')}
                </p>
                {o.emi_progress && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {o.emi_progress.paid} of {o.emi_progress.total} installments paid
                  </p>
                )}
              </div>
              {(o.status === 'pending' || o.status === 'emi_active') && (
                <Link
                  to={`/checkout/${o.id}`}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
                >
                  {o.status === 'emi_active' ? 'Pay next installment' : 'Complete payment'}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
