import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';

const UNIT_PRICE = 799;

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
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    quantity: Number(searchParams.get('quantity')) || 1,
  });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const { data } = await client.post('/orders', form);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

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
      name: 'PowerGlove',
      description: `PowerGlove × ${order.quantity}`,
      order_id: order.razorpay_order_id,
      prefill: {
        name: order.customer_name,
        email: order.email,
        contact: order.phone,
      },
      handler: async (response) => {
        try {
          const { data } = await client.post(`/orders/${order.id}/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setOrder(data);
        } catch (err) {
          setError(err.response?.data?.error || 'Payment succeeded but verification failed. Contact support.');
        } finally {
          setPaying(false);
        }
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
      theme: { color: '#ea580c' },
    });
    rzp.on('payment.failed', (response) => {
      setError(response.error?.description || 'Payment failed');
      setPaying(false);
    });
    rzp.open();
  }

  const inputClass =
    'w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  if (order?.status === 'paid') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order confirmed!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thanks, {order.customer_name} — your PowerGlove order #{order.id} is on its way. A
          confirmation has been sent to {order.email}.
        </p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-6 py-2.5 rounded-full hover:shadow-md transition-all"
        >
          Back to home
        </Link>
      </div>
    );
  }

  if (order) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm payment</h1>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-500 dark:text-gray-400">Quantity</span>
              <span className="text-gray-900 dark:text-white font-medium">{order.quantity}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500 dark:text-gray-400">Unit price</span>
              <span className="text-gray-900 dark:text-white">₹{Number(order.unit_price).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
              <span className="text-gray-900 dark:text-white font-bold">
                ₹{Number(order.total_amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {form.quantity} × PowerGlove — ₹{(UNIT_PRICE * form.quantity).toLocaleString('en-IN')}
        </p>

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              required
              value={form.customerName}
              onChange={(e) => update('customerName', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea
              required
              rows={2}
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>City</label>
              <input
                required
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Pincode</label>
              <input
                required
                value={form.pincode}
                onChange={(e) => update('pincode', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Quantity</label>
            <input
              required
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => update('quantity', Number(e.target.value))}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={placing}
            className="w-full bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-semibold py-2.5 rounded-full transition-all disabled:opacity-60"
          >
            {placing ? 'Placing order…' : `Continue to Payment — ₹${(UNIT_PRICE * form.quantity).toLocaleString('en-IN')}`}
          </button>
        </form>
      </div>
    </div>
  );
}
