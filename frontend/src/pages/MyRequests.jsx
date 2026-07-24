import { useEffect, useState } from 'react';
import client from '../api/client';
import MessageThread from '../components/MessageThread';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { InboxIcon, BoltIcon } from '../components/icons';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-brand-100 text-brand-700',
  declined: 'bg-red-100 text-red-700',
};

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [openThreadId, setOpenThreadId] = useState(null);

  async function fetchRequests() {
    setLoading(true);
    const { data } = await client.get('/requests/mine');
    setRequests(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function cancel(id) {
    setActingId(id);
    try {
      await client.delete(`/requests/${id}`);
      await fetchRequests();
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Requests</h1>

      {loading ? (
        <Spinner label="Loading requests…" />
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <InboxIcon className="w-10 h-10 mx-auto mb-3" />
          <p>You haven't sent any requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="border border-gray-200 bg-white rounded-xl p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar name={r.seller_name} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{r.seller_name}</span>
                      {r.is_priority && (
                        <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">
                          ⭐ Community Priority
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                      {Number(r.kwh_requested).toFixed(1)} kWh at ₹{Number(r.price_applied).toFixed(2)}
                      /kWh · {r.location}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 self-start sm:self-auto">
                  {r.status === 'pending' && (
                    <button
                      onClick={() => cancel(r.id)}
                      disabled={actingId === r.id}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                    >
                      Cancel request
                    </button>
                  )}
                  <button
                    onClick={() => setOpenThreadId(openThreadId === r.id ? null : r.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {openThreadId === r.id ? 'Hide messages' : 'Message'}
                  </button>
                </div>
              </div>

              {openThreadId === r.id && <MessageThread requestId={r.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
