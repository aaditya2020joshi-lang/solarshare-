import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { InboxIcon, BoltIcon, LocationIcon } from '../components/icons';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState('');

  async function fetchListings() {
    setLoading(true);
    const { data } = await client.get('/listings/mine');
    setListings(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchListings();
  }, []);

  async function closeListing(id) {
    setActingId(id);
    setError('');
    try {
      await client.put(`/listings/${id}/close`);
      await fetchListings();
    } finally {
      setActingId(null);
    }
  }

  async function deleteListing(id) {
    setActingId(id);
    setError('');
    try {
      await client.delete(`/listings/${id}`);
      await fetchListings();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete this listing');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link
          to="/seller/listings/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          New Listing
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <Spinner label="Loading listings…" />
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <InboxIcon className="w-10 h-10 mx-auto mb-3" />
          <p>You haven't created any listings yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="border border-gray-200 bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-shadow hover:shadow-sm"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    <LocationIcon className="w-3.5 h-3.5 text-gray-400" />
                    {l.location}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      l.status === 'active'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                  {Number(l.kwh_available).toFixed(1)} kWh available · ₹
                  {Number(l.standard_price).toFixed(2)}/kWh
                  {l.community_price !== null &&
                    ` (community: ₹${Number(l.community_price).toFixed(2)})`}
                </p>
              </div>

              <div className="flex gap-2 self-start sm:self-auto">
                {l.status === 'active' && (
                  <button
                    onClick={() => closeListing(l.id)}
                    disabled={actingId === l.id}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => deleteListing(l.id)}
                  disabled={actingId === l.id}
                  className="bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
