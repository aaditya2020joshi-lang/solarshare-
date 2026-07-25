import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import Spinner from '../components/Spinner';
import { InboxIcon } from '../components/icons';

export default function Listings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minKwh, setMinKwh] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  const hasFilters = Boolean(location || maxPrice || minKwh);

  async function fetchListings(e, overrides = {}) {
    e?.preventDefault();
    setLoading(true);
    const params = { sort: overrides.sort ?? sort };
    const loc = overrides.location ?? location;
    const price = overrides.maxPrice ?? maxPrice;
    const kwh = overrides.minKwh ?? minKwh;
    if (loc) params.location = loc;
    if (price) params.maxPrice = price;
    if (kwh) params.minKwh = kwh;
    const { data } = await client.get('/listings', { params });
    setListings(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchListings();
  }, []);

  function handleSortChange(e) {
    const next = e.target.value;
    setSort(next);
    fetchListings(null, { sort: next });
  }

  function clearFilters() {
    setLocation('');
    setMaxPrice('');
    setMinKwh('');
    fetchListings(null, { location: '', maxPrice: '', minKwh: '' });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Energy Listings</h1>
        <Link
          to="/learn#request-flow"
          className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
        >
          How does requesting energy work? →
        </Link>
      </div>

      {user?.role === 'buyer' && user.communityPriority && (
        <p className="text-sm bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900 rounded-lg px-3 py-2 mb-6 inline-block">
          ⭐ Community Priority is on — you'll automatically see discounted rates on listings that
          offer them, and your requests are surfaced first to sellers.
        </p>
      )}

      <form onSubmit={fetchListings} className="flex flex-wrap items-end gap-3 mb-6">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Location
          </label>
          <input
            placeholder="e.g. Bengaluru"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Max price/kWh
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="₹ per kWh"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Min kWh available
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="kWh"
            value={minKwh}
            onChange={(e) => setMinKwh(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="w-44">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Sort by
          </label>
          <select
            value={sort}
            onChange={handleSortChange}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-medium px-5 py-2 rounded-full text-sm transition-all"
        >
          Search
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline px-1 py-2"
          >
            Clear filters
          </button>
        )}
      </form>

      {loading ? (
        <Spinner label="Loading listings…" />
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <InboxIcon className="w-10 h-10 mx-auto mb-3" />
          <p>No listings match your search.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-brand-600 dark:text-brand-400 hover:underline text-sm mt-2"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {listings.length} listing{listings.length === 1 ? '' : 's'} found
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
