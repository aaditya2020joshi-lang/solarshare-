import { useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ListingCard({ listing }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [kwh, setKwh] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      setStatus({ ok: true, message: 'Request sent!' });
      setKwh('');
    } catch (err) {
      setStatus({ ok: false, message: err.response?.data?.error || 'Could not send request' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{listing.location}</h3>
        <span className="text-xs text-gray-500">by {listing.seller_name}</span>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {Number(listing.kwh_available).toFixed(1)} kWh available
      </p>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xl font-bold ${
            isPriorityBuyer && hasCommunityPrice ? 'text-brand-600' : 'text-gray-900'
          }`}
        >
          ${Number(effectivePrice).toFixed(2)}/kWh
        </span>
        {isPriorityBuyer && hasCommunityPrice && (
          <span className="line-through text-sm text-gray-400">
            ${Number(listing.standard_price).toFixed(2)}
          </span>
        )}
        {hasCommunityPrice && !isPriorityBuyer && (
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
            Community rate available
          </span>
        )}
      </div>

      {user?.role === 'buyer' && (
        <>
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition"
            >
              Request Energy
            </button>
          ) : (
            <form onSubmit={handleRequest} className="flex gap-2">
              <input
                required
                type="number"
                step="0.1"
                min="0.1"
                max={listing.kwh_available}
                placeholder="kWh"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 rounded-lg text-sm disabled:opacity-60"
              >
                Send
              </button>
            </form>
          )}
          {status && (
            <p className={`text-sm mt-2 ${status.ok ? 'text-brand-700' : 'text-red-600'}`}>
              {status.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
