import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { getPanelImage } from '../lib/panelImages';
import Spinner from '../components/Spinner';
import { BoltIcon, LocationIcon } from '../components/icons';

const PLATFORM_FEE = 49;

export default function PanelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentPlan, setPaymentPlan] = useState('full');
  const [emiMonths, setEmiMonths] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get(`/panels/${id}`);
        setPanel(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load this panel');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10"><Spinner label="Loading panel…" /></div>;
  if (error || !panel) {
    return <p className="max-w-2xl mx-auto px-4 py-10 text-red-600 dark:text-red-400">{error || 'Panel not found'}</p>;
  }

  async function handleBuy(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setBuyError('');
    try {
      const { data } = await client.post('/panel-orders', {
        panelId: panel.id,
        quantity: Number(quantity),
        paymentPlan,
        emiMonths: paymentPlan === 'emi' ? emiMonths : undefined,
      });
      navigate(`/checkout/${data.id}`);
    } catch (err) {
      setBuyError(err.response?.data?.error || 'Could not start checkout');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/panels" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
        ← Back to marketplace
      </Link>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mt-4">
        <div className="relative h-56 bg-gradient-to-br from-brand-50 via-sky-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
          <img
            src={getPanelImage(panel.id)}
            alt="Solar panel"
            loading="lazy"
            className="w-full h-full object-contain p-8"
          />
          <span className="absolute top-3 left-3 text-xs font-medium bg-white/85 dark:bg-gray-900/80 backdrop-blur text-gray-800 dark:text-gray-100 px-2.5 py-1 rounded-full shadow-sm">
            {panel.panel_type}
          </span>
          <span className="absolute bottom-3 right-3 text-xs font-medium bg-white/85 dark:bg-gray-900/80 backdrop-blur text-brand-700 dark:text-brand-300 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
            {panel.wattage}W
          </span>
        </div>

        <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{panel.name}</h1>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Avatar name={panel.vendor_name} size="w-7 h-7" />
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Sold by {panel.vendor_name}
            {panel.vendor_location && (
              <>
                <LocationIcon className="w-3.5 h-3.5 text-gray-400 ml-1" />
                {panel.vendor_location}
              </>
            )}
          </p>
        </div>

        {panel.vendor_description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{panel.vendor_description}</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <BoltIcon className="w-3.5 h-3.5 text-amber-500" /> Wattage
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{panel.wattage}W</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price per panel</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ₹{Number(panel.price).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {panel.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            {panel.description}
          </p>
        )}

        <form onSubmit={handleBuy} className="border-t border-gray-100 dark:border-gray-800 pt-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 text-sm space-y-1">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Panel subtotal</span>
              <span>₹{(Number(panel.price) * Number(quantity || 0)).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Platform fee</span>
              <span>₹{PLATFORM_FEE}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span>
                ₹{(Number(panel.price) * Number(quantity || 0) + PLATFORM_FEE).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How would you like to pay?
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentPlan('full')}
                className={`text-left border rounded-lg p-3 transition-colors ${
                  paymentPlan === 'full'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">Pay in full</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">One payment today</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentPlan('emi')}
                className={`text-left border rounded-lg p-3 transition-colors ${
                  paymentPlan === 'emi'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Pay via EMI
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  No lump sum — easy monthly installments
                </span>
              </button>
            </div>

            {paymentPlan === 'emi' && (
              <div className="mt-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Number of months
                </label>
                <div className="flex gap-2 mb-3">
                  {[3, 6, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEmiMonths(m)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        emiMonths === m
                          ? 'bg-gradient-to-r from-brand-600 to-sky-accent text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {m} months
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  ≈{' '}
                  <span className="font-semibold text-brand-700 dark:text-brand-400">
                    ₹
                    {Math.ceil(
                      (Number(panel.price) * Number(quantity || 0) + PLATFORM_FEE) / emiMonths
                    ).toLocaleString('en-IN')}
                    /month
                  </span>{' '}
                  for {emiMonths} months. Pay the first installment now via UPI, card, or netbanking — no
                  credit card or bank loan needed.
                </p>
              </div>
            )}
          </div>

          {buyError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{buyError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-semibold py-2.5 rounded-full transition-all disabled:opacity-60"
          >
            {submitting ? 'Starting checkout…' : paymentPlan === 'emi' ? 'Continue with EMI' : 'Buy Now'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
