import { useEffect, useState } from 'react';
import client from '../api/client';
import MessageThread from '../components/MessageThread';

export default function SellerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [openThreadId, setOpenThreadId] = useState(null);

  async function fetchRequests() {
    setLoading(true);
    const { data } = await client.get('/requests/incoming');
    setRequests(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function respond(id, decision) {
    setActingId(id);
    try {
      await client.put(`/requests/${id}/respond`, { decision });
      await fetchRequests();
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Incoming Requests</h1>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className={`border rounded-xl p-4 ${
                r.is_priority
                  ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-200'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{r.buyer_name}</span>
                    {r.is_priority && (
                      <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">
                        ⭐ Community Priority
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : r.status === 'accepted'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Number(r.kwh_requested).toFixed(1)} kWh at ₹{Number(r.price_applied).toFixed(2)}
                    /kWh · {r.location}
                  </p>
                </div>

                <div className="flex gap-2 self-start sm:self-auto">
                  {r.status === 'pending' && (
                    <>
                      <button
                        onClick={() => respond(r.id, 'accepted')}
                        disabled={actingId === r.id}
                        className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respond(r.id, 'declined')}
                        disabled={actingId === r.id}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setOpenThreadId(openThreadId === r.id ? null : r.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg"
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
