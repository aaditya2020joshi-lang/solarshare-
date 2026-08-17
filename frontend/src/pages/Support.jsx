import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function storageKey(userId) {
  return `sahara_tickets_${userId}`;
}

const RESOLUTION_NOTES = [
  'Payment traced and confirmed — funds were credited to the correct account within normal settlement time.',
  'Found the stuck transaction with our payment partner and manually released it.',
  "The failure was caused by a temporary bank-side outage — retried the payment and it's gone through.",
];

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [description, setDescription] = useState('');
  const timers = useRef([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(user.id));
    setTickets(stored ? JSON.parse(stored) : []);
    return () => timers.current.forEach(clearTimeout);
  }, [user.id]);

  function persist(next) {
    setTickets(next);
    localStorage.setItem(storageKey(user.id), JSON.stringify(next));
  }

  function submitTicket(e) {
    e.preventDefault();
    if (!description.trim()) return;

    const ticket = {
      id: `SB-${Math.floor(10000 + Math.random() * 89999)}`,
      description: description.trim(),
      status: 'Investigating',
      createdAt: new Date().toISOString(),
      resolution: null,
    };

    const next = [ticket, ...tickets];
    persist(next);
    setDescription('');

    const timer = setTimeout(() => {
      setTickets((current) => {
        const updated = current.map((t) =>
          t.id === ticket.id
            ? {
                ...t,
                status: 'Resolved',
                resolution: RESOLUTION_NOTES[Math.floor(Math.random() * RESOLUTION_NOTES.length)],
              }
            : t
        );
        localStorage.setItem(storageKey(user.id), JSON.stringify(updated));
        return updated;
      });
    }, 2500);
    timers.current.push(timer);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Good Payment Failure Support</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Tell us what happened — a real support flow tracks down failed or stuck payments instead of leaving you guessing.
      </p>

      <form
        onSubmit={submitTicket}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 mb-10"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          What went wrong?
        </label>
        <textarea
          required
          rows={3}
          placeholder="e.g. My salary transfer failed and the money hasn't come back"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-6 py-2.5 rounded-full hover:shadow-md transition-all"
        >
          Submit
        </button>
      </form>

      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Your tickets</h2>
      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No support tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{ticket.id}</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    ticket.status === 'Resolved'
                      ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 animate-pulse'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{ticket.description}</p>
              {ticket.resolution && (
                <p className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Resolution: </span>
                  {ticket.resolution}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-4">
        Demo flow — tickets resolve automatically after a few seconds to illustrate the support experience.
      </p>
    </div>
  );
}
