import { useEffect, useState } from 'react';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { TrashIcon, BellIcon, ClockIcon } from '../components/icons';
import {
  enablePushNotifications,
  disablePushNotifications,
  getExistingSubscription,
  getPermissionState,
  isPushSupported,
} from '../utils/push';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState('');
  const [pushMessage, setPushMessage] = useState('');

  function load() {
    return client.get('/reminders').then((res) => setReminders(res.data.reminders));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    getExistingSubscription().then((sub) => setPushEnabled(!!sub));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim() || !remindAt) return;
    setSubmitting(true);
    setError('');
    try {
      await client.post('/reminders', { title, message, remind_at: remindAt, repeat });
      setTitle('');
      setMessage('');
      setRemindAt('');
      setRepeat('none');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create reminder.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await client.delete(`/reminders/${id}`);
    load();
  }

  async function handleEnablePush() {
    setPushBusy(true);
    setPushError('');
    setPushMessage('');
    try {
      await enablePushNotifications();
      setPushEnabled(true);
    } catch (err) {
      setPushError(err.message || 'Could not enable notifications.');
    } finally {
      setPushBusy(false);
    }
  }

  async function handleDisablePush() {
    setPushBusy(true);
    setPushError('');
    setPushMessage('');
    try {
      await disablePushNotifications();
      setPushEnabled(false);
    } finally {
      setPushBusy(false);
    }
  }

  async function handleTestNotification() {
    setPushBusy(true);
    setPushError('');
    setPushMessage('');
    try {
      await client.post('/push/test');
      setPushMessage('Test notification sent — check your notifications.');
    } catch (err) {
      setPushError(err.response?.data?.error || 'Could not send test notification.');
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">Reminders</h1>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BellIcon className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        {!isPushSupported() ? (
          <p className="text-sm text-gray-500">Your browser doesn't support push notifications.</p>
        ) : getPermissionState() === 'denied' ? (
          <p className="text-sm text-red-600">
            Notifications are blocked for this site. Enable them in your browser's site settings.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {pushEnabled ? (
              <>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Enabled on this device</span>
                <button
                  onClick={handleTestNotification}
                  disabled={pushBusy}
                  className="text-sm font-medium text-brand-600 dark:text-brand-400"
                >
                  Send test notification
                </button>
                <button onClick={handleDisablePush} disabled={pushBusy} className="text-sm text-gray-500">
                  Turn off
                </button>
              </>
            ) : (
              <button
                onClick={handleEnablePush}
                disabled={pushBusy}
                className="bg-gradient-to-r from-brand-600 to-sky-accent text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              >
                {pushBusy ? 'Enabling…' : 'Enable notifications'}
              </button>
            )}
          </div>
        )}
        {pushError && <p className="text-sm text-red-600 mt-2">{pushError}</p>}
        {pushMessage && <p className="text-sm text-green-600 mt-2">{pushMessage}</p>}
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 mb-8 flex flex-col gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Revise Chapter 4"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message (optional)
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & time</label>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repeat</label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="none">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          Add reminder
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : reminders.length === 0 ? (
        <p className="text-sm text-gray-500">No reminders yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reminders.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{r.title}</div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(r.remind_at)}
                    {r.repeat !== 'none' && ` · repeats ${r.repeat}`}
                    {Boolean(r.sent) && r.repeat === 'none' && ' · sent'}
                  </div>
                  {r.message && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.message}</div>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                aria-label="Delete reminder"
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
