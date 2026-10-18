import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import client from '../api/client';

function fmt(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

function dayLabel(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function History({ userId, name, onClose }) {
  const [days, setDays] = useState(null);

  useEffect(() => {
    client
      .get('/presence/history', { params: { user_id: userId } })
      .then((res) => setDays(res.data.days))
      .catch(() => setDays([]));
  }, [userId]);

  // Show every one of the last 14 days, including the days with no study.
  const map = new Map((days || []).map((d) => [d.day, d.seconds]));
  const rows = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-CA');
    rows.push({ day: key, seconds: map.get(key) || 0 });
  }
  const max = Math.max(1, ...rows.map((r) => r.seconds));
  const total = rows.reduce((a, r) => a + r.seconds, 0);
  const studied = rows.filter((r) => r.seconds > 0).length;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">Daily history · {name}</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-xl leading-none">
            ×
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Last 14 days · studied on {studied} {studied === 1 ? 'day' : 'days'} · {fmtShort(total)} in total
        </p>
        {days === null ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((r) => (
              <li key={r.day} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-gray-600 dark:text-gray-400">{dayLabel(r.day)}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-sky-accent"
                    style={{ width: `${(r.seconds / max) * 100}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right tabular-nums text-gray-900 dark:text-white">
                  {r.seconds ? fmtShort(r.seconds) : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body
  );
}

function fmtShort(totalSeconds) {
  const m = Math.round(totalSeconds / 60);
  if (m < 1) return `${Math.floor(totalSeconds)}s`;
  const h = Math.floor(m / 60);
  return h ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
}

export default function SiteTime() {
  const [historyFor, setHistoryFor] = useState(null);
  const [editing, setEditing] = useState(null);
  const [hrs, setHrs] = useState('');
  const [mins, setMins] = useState('');
  const [editError, setEditError] = useState('');

  function setToday(u) {
    const total = Math.floor(u.today_seconds / 60);
    setHrs(String(Math.floor(total / 60)));
    setMins(String(total % 60));
    setEditError('');
    setEditing(u);
  }

  async function saveToday(e) {
    e.preventDefault();
    const minutes = (Number(hrs) || 0) * 60 + (Number(mins) || 0);
    try {
      await client.post('/presence/set-today', { minutes });
      const res = await client.get('/presence');
      setUsers(res.data.users);
      setFetchedAt(Date.now());
      setEditing(null);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Could not save.');
    }
  }
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [tick, setTick] = useState(0);
  const [fetchedAt, setFetchedAt] = useState(Date.now());

  useEffect(() => {
    let alive = true;
    const load = () =>
      client
        .get('/presence')
        .then((res) => {
          if (!alive) return;
          setUsers(res.data.users);
          setMe(res.data.me);
          setFetchedAt(Date.now());
        })
        .catch(() => {});
    load();
    const poll = setInterval(load, 10000);
    const clock = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      alive = false;
      clearInterval(poll);
      clearInterval(clock);
    };
  }, []);

  // Between refreshes the running timers advance on screen once a second.
  const extra = Math.floor((Date.now() - fetchedAt) / 1000) + 0 * tick;

  return (
    <aside className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Time on the website</h2>
      <ul className="flex flex-col gap-3">
        {users.map((u) => {
          const live = u.online;
          const todayShown = u.today_seconds + (live ? extra : 0);
          const totalShown = u.total_seconds + (live ? extra : 0);
          const notOpened = !live && u.today_seconds === 0;
          return (
            <li key={u.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {u.name}
                  {u.id === me ? ' (you)' : ''}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    live ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                  {live ? 'Online' : notOpened ? 'Not Opened' : 'Closed'}
                </span>
              </div>
              {notOpened ? (
                <div className="text-sm text-gray-500">Not Opened</div>
              ) : (
                <div className="font-mono text-xl font-semibold text-gray-900 dark:text-white tabular-nums">
                  {fmt(todayShown)}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Today{live ? ' · running' : notOpened ? '' : ' · stopped'} · Total {fmt(totalShown)}
              </div>
              {u.id === me && (
                <button
                  type="button"
                  onClick={() => setToday(u)}
                  className="mt-2 mr-3 text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Set today's time
                </button>
              )}
              <button
                type="button"
                onClick={() => setHistoryFor(u)}
                className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                History
              </button>
              {editing && editing.id === u.id && (
        <form onSubmit={saveToday} className="mt-2 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
          <div className="text-xs text-gray-500 mb-2">Set today's study time</div>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              min="0"
              max="24"
              value={hrs}
              onChange={(e) => setHrs(e.target.value)}
              className="w-14 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-gray-900 dark:text-white"
            />
            <span className="text-gray-500">h</span>
            <input
              type="number"
              min="0"
              max="59"
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              className="w-14 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-gray-900 dark:text-white"
            />
            <span className="text-gray-500">m</span>
          </div>
          {editError && <p className="text-xs text-red-600 mt-1">{editError}</p>}
          <div className="flex gap-2 mt-2">
            <button type="submit" className="text-xs font-semibold text-white bg-brand-600 rounded-lg px-3 py-1">
              Save
            </button>
            <button type="button" onClick={() => setEditing(null)} className="text-xs text-gray-500">
              Cancel
            </button>
          </div>
        </form>
      )}
            </li>
          );
        })}
        {users.length === 0 && <li className="text-sm text-gray-500">No users yet.</li>}
      </ul>
      {historyFor && <History userId={historyFor.id} name={historyFor.name} onClose={() => setHistoryFor(null)} />}
    </aside>
  );
}
