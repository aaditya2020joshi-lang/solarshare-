import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  async function load() {
    try {
      const { data } = await client.get(`/panel-orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load this order');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handlePayNow() {
    setError('');
    setPaying(true);
    const ready = await loadRazorpayScript();
    if (!ready) {
      setError('Could not load Razorpay checkout. Check your connection and try again.');
      setPaying(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: order.razorpay_key_id,
      amount: Math.round(Number(order.total_amount) * 100),
      currency: 'INR',
      name: 'SolarShareOne',
      description: `${order.panel_name} × ${order.quantity}`,
      order_id: order.razorpay_order_id,
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      handler: async (response) => {
        try {
          await client.post(`/panel-orders/${id}/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          await load();
        } catch (err) {
          setError(err.response?.data?.error || 'Payment succeeded but verification failed. Contact support.');
        } finally {
          setPaying(false);
        }
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
      theme: { color: '#16a34a' },
    });
    rzp.on('payment.failed', (response) => {
      setError(response.error?.description || 'Payment failed');
      setPaying(false);
    });
    rzp.open();
  }

  if (loading) return <div className="max-w-md mx-auto px-4 py-10"><Spinner label="Loading checkout…" /></div>;
  if (error && !order) {
    return <p className="max-w-md mx-auto px-4 py-10 text-red-600 dark:text-red-400">{error}</p>;
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
          <div className="flex justify-between mb-1">
            <span className="text-gray-500 dark:text-gray-400">Platform fee</span>
            <span className="text-gray-900 dark:text-white">
              ₹{Number(order.platform_fee).toLocaleString('en-IN')}
            </span>
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
            <p className="text-brand-700 dark:text-brand-400 font-semibold mb-1">Payment verified</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your payment to {order.vendor_name} was confirmed via Razorpay. They'll be in touch to
              arrange delivery/installation.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Pay securely via UPI, card, netbanking, or wallet — powered by Razorpay.
            </p>

            {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">{error}</p>}

            <button
              onClick={handlePayNow}
              disabled={paying}
              className="w-full bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-semibold py-2.5 rounded-full transition-all disabled:opacity-60"
            >
              {paying ? 'Processing…' : `Pay ₹${Number(order.total_amount).toLocaleString('en-IN')}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
