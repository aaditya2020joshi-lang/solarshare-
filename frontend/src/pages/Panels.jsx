import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import PanelCard from '../components/PanelCard';
import RooftopScene from '../components/RooftopScene';
import Spinner from '../components/Spinner';
import { InboxIcon } from '../components/icons';

export default function Panels() {
  const [searchParams] = useSearchParams();
  const [panels, setPanels] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [panelType, setPanelType] = useState(searchParams.get('panelType') || '');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchPanels(e) {
    e?.preventDefault();
    setLoading(true);
    const params = {};
    if (vendorId) params.vendorId = vendorId;
    if (panelType) params.panelType = panelType;
    if (maxPrice) params.maxPrice = maxPrice;
    const { data } = await client.get('/panels', { params });
    setPanels(data);
    setLoading(false);
  }

  useEffect(() => {
    client.get('/vendors').then(({ data }) => setVendors(data));
    fetchPanels();
  }, []);

  const inputClass =
    'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
        <RooftopScene className="w-full h-40 sm:h-56" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Solar Panel Marketplace</h1>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
        Browse panels from vendors and buy directly — like the ones installed on the rooftop above.
        Checkout is secured by Razorpay — pay via UPI, card, netbanking, or wallet.
      </p>

      <form onSubmit={fetchPanels} className="flex flex-wrap gap-3 mb-8">
        <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className={inputClass}>
          <option value="">All vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <select value={panelType} onChange={(e) => setPanelType(e.target.value)} className={inputClass}>
          <option value="">All panel types</option>
          <option value="Monocrystalline">Monocrystalline</option>
          <option value="Polycrystalline">Polycrystalline</option>
          <option value="Thin-Film">Thin-Film</option>
        </select>
        <input
          type="number"
          step="100"
          placeholder="Max price (₹)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={`${inputClass} w-40`}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white font-medium px-5 rounded-full text-sm transition-all"
        >
          Search
        </button>
      </form>

      {loading ? (
        <Spinner label="Loading panels…" />
      ) : panels.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <InboxIcon className="w-10 h-10 mx-auto mb-3" />
          <p>No panels match your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {panels.map((panel) => (
            <PanelCard key={panel.id} panel={panel} />
          ))}
        </div>
      )}
    </div>
  );
}
