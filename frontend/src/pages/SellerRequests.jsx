import { useEffect, useState } from 'react';
import client from '../api/client';
import MessageThread from '../components/MessageThread';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { InboxIcon, BoltIcon } from '../components/icons';

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Incoming Requests</h1>

      {loading ? (
        <Spinner label="Loading requests…" />
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <InboxIcon className="w-10 h-10 mx-auto mb-3" />
          <p>No requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
                r.is_priority
                  ? 'border-brand-400 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/40 ring-1 ring-brand-200 dark:ring-brand-800'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar name={r.buyer_name} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{r.buyer_name}</span>
                      {r.is_priority && (
                        <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">
                          ⭐ Community Priority
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                            : r.status === 'accepted'
                            ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                      {Number(r.kwh_requested).toFixed(1)} kWh at ₹{Number(r.price_applied).toFixed(2)}
                      /kWh · {r.location}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 self-start sm:self-auto">
                  {r.status === 'pending' && (
                    <>
                      <button
                        onClick={() => respond(r.id, 'accepted')}
                        disabled={actingId === r.id}
                        className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respond(r.id, 'declined')}
                        disabled={actingId === r.id}
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setOpenThreadId(openThreadId === r.id ? null : r.id)}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
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
