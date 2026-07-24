import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { BoltIcon, RupeeIcon, CalendarIcon } from '../components/icons';

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kwh, setKwh] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get(`/listings/${id}`);
        setListing(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load this listing');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10"><Spinner label="Loading listing…" /></div>;
  if (error || !listing) {
    return <p className="max-w-2xl mx-auto px-4 py-10 text-red-600">{error || 'Listing not found'}</p>;
  }

  const isPriorityBuyer = user?.role === 'buyer' && user.communityPriority;
  const hasCommunityPrice = listing.community_price !== null;
  const effectivePrice =
    isPriorityBuyer && hasCommunityPrice ? listing.community_price : listing.standard_price;

  async function handleRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await client.post('/requests', { listingId: listing.id, kwhRequested: Number(kwh) });
      setStatus({ ok: true, message: 'Request sent! Check "My Requests" for updates.' });
      setKwh('');
    } catch (err) {
      setStatus({ ok: false, message: err.response?.data?.error || 'Could not send request' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/listings" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
        ← Back to listings
      </Link>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 mt-4">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{listing.location}</h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              listing.status === 'active'
                ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {listing.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <Avatar name={listing.seller_name} size="w-7 h-7" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Listed by {listing.seller_name}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <BoltIcon className="w-3.5 h-3.5 text-amber-500" /> Available energy
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {Number(listing.kwh_available).toFixed(1)} kWh
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <RupeeIcon className="w-3.5 h-3.5 text-gray-400" /> Price
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-semibold ${
                  isPriorityBuyer && hasCommunityPrice
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                ₹{Number(effectivePrice).toFixed(2)}/kWh
              </span>
              {isPriorityBuyer && hasCommunityPrice && (
                <span className="line-through text-sm text-gray-400 dark:text-gray-500">
                  ₹{Number(listing.standard_price).toFixed(2)}
                </span>
              )}
              {hasCommunityPrice && !isPriorityBuyer && (
                <span className="text-xs bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                  Community rate available
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-gray-400" /> Available from
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">{formatDateTime(listing.available_from)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-gray-400" /> Available to
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">{formatDateTime(listing.available_to)}</p>
          </div>
        </div>

        {user?.role === 'buyer' && listing.status === 'active' && (
          <form onSubmit={handleRequest} className="border-t border-gray-100 dark:border-gray-800 pt-5 flex gap-2">
            <input
              required
              type="number"
              step="0.1"
              min="0.1"
              max={listing.kwh_available}
              placeholder="kWh to request"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-medium px-5 rounded-full text-sm transition-all disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Request Energy'}
            </button>
          </form>
        )}

        {status && (
          <p className={`text-sm mt-3 ${status.ok ? 'text-brand-700 dark:text-brand-400' : 'text-red-600 dark:text-red-400'}`}>
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}
