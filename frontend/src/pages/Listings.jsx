import { useEffect, useState } from 'react';
import client from '../api/client';
import ListingCard from '../components/ListingCard';
import Spinner from '../components/Spinner';
import { InboxIcon } from '../components/icons';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minKwh, setMinKwh] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  async function fetchListings(e, sortOverride) {
    e?.preventDefault();
    setLoading(true);
    const params = { sort: sortOverride ?? sort };
    if (location) params.location = location;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minKwh) params.minKwh = minKwh;
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
    fetchListings(null, next);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Energy Listings</h1>

      <form onSubmit={fetchListings} className="flex flex-wrap gap-3 mb-8">
        <input
          placeholder="Filter by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Max price per kWh"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Min kWh available"
          value={minKwh}
          onChange={(e) => setMinKwh(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={sort}
          onChange={handleSortChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 rounded-lg text-sm"
        >
          Search
        </button>
      </form>

      {loading ? (
        <Spinner label="Loading listings…" />
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <InboxIcon className="w-10 h-10 mx-auto mb-3" />
          <p>No listings match your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
