import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import client from '../api/client';
import Spinner from '../components/Spinner';

function buildUpiUri(order) {
  const params = new URLSearchParams({
    pa: order.upi_id,
    pn: order.payee_name,
    am: Number(order.total_amount).toFixed(2),
    cu: 'INR',
    tn: `SolarShare order #${order.id} - ${order.panel_name}`,
  });
  return `upi://pay?${params.toString()}`;
}

export default function Checkout() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  async function load() {
    try {
      const { data } = await client.get(`/panel-orders/${id}`);
      setOrder(data);
      const uri = buildUpiUri(data);
      const dataUrl = await QRCode.toDataURL(uri, { width: 220, margin: 1 });
      setQrDataUrl(dataUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load this order');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleConfirmPaid() {
    setConfirming(true);
    try {
      await client.put(`/panel-orders/${id}/mark-paid`);
      await load();
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return <div className="max-w-md mx-auto px-4 py-10"><Spinner label="Loading checkout…" /></div>;
  if (error || !order) {
    return <p className="max-w-md mx-auto px-4 py-10 text-red-600 dark:text-red-400">{error || 'Order not found'}</p>;
  }

  const isPaid = order.status === 'payment_claimed';

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Link to="/panels" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
        ← Back to marketplace
      </Link>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 mt-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Checkout</h1>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500 dark:text-gray-400">Item</span>
            <span className="text-gray-900 dark:text-white font-medium">{order.panel_name}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-500 dark:text-gray-400">Vendor</span>
            <span className="text-gray-900 dark:text-white">{order.vendor_name}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-500 dark:text-gray-400">Quantity</span>
            <span className="text-gray-900 dark:text-white">{order.quantity}</span>
          </div>
          <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
            <span className="text-gray-900 dark:text-white font-bold">
              ₹{Number(order.total_amount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {isPaid ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-brand-700 dark:text-brand-400 font-semibold mb-1">Payment marked as complete</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You confirmed you've paid {order.vendor_name} via UPI. They'll be in touch to arrange
              delivery/installation.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Scan with any UPI app (Google Pay, PhonePe, Paytm) to pay {order.vendor_name} directly.
            </p>
            <div className="flex justify-center mb-4">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="UPI payment QR code"
                  className="rounded-xl border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-6">
              Paying to UPI ID: {order.upi_id}
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 mb-4 text-xs text-yellow-800 dark:text-yellow-300">
              This is a direct UPI payment between you and the vendor — SolarShare doesn't process
              or verify it automatically. Only confirm below once you've actually completed the
              payment.
            </div>

            <button
              onClick={handleConfirmPaid}
              disabled={confirming}
              className="w-full bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-semibold py-2.5 rounded-full transition-all disabled:opacity-60"
            >
              {confirming ? 'Confirming…' : "I've completed the payment"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
