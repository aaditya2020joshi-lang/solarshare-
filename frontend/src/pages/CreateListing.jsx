import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    kwhAvailable: '',
    standardPrice: '',
    communityPrice: '',
    location: '',
    availableFrom: '',
    availableTo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await client.post('/listings', {
        ...form,
        communityPrice: form.communityPrice || null,
      });
      navigate('/seller/listings');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a new listing</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available energy (kWh)
          </label>
          <input
            required
            type="number"
            step="0.1"
            min="0.1"
            value={form.kwhAvailable}
            onChange={(e) => update('kwhAvailable', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standard price per kWh (₹)
          </label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.standardPrice}
            onChange={(e) => update('standardPrice', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Community price per kWh (₹) — optional
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Leave blank to skip"
            value={form.communityPrice}
            onChange={(e) => update('communityPrice', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Automatically applied to buyers with the Community Priority flag.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            required
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available from</label>
            <input
              required
              type="datetime-local"
              value={form.availableFrom}
              onChange={(e) => update('availableFrom', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available to</label>
            <input
              required
              type="datetime-local"
              value={form.availableTo}
              onChange={(e) => update('availableTo', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}
