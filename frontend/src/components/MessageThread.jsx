import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Spinner from './Spinner';

export default function MessageThread({ requestId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function fetchMessages() {
    const { data } = await client.get(`/requests/${requestId}/messages`);
    setMessages(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchMessages();
  }, [requestId]);

  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await client.post(`/requests/${requestId}/messages`, { body });
      setBody('');
      await fetchMessages();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3">
      {loading ? (
        <Spinner label="Loading messages…" className="text-xs" />
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
          {messages.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">No messages yet — say hello.</p>
          )}
          {messages.map((m) => {
            const isMine = m.sender_id === user.id;
            return (
              <div
                key={m.id}
                className={`flex items-end gap-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && <Avatar name={m.sender_name} size="w-5 h-5" />}
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-1.5 text-sm ${
                    isMine ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {!isMine && <p className="text-xs font-medium opacity-70">{m.sender_name}</p>}
                  <p>{m.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 rounded-lg transition-colors disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
