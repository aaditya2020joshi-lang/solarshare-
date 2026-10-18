import { useEffect, useState } from 'react';
import client from '../api/client';

function fmt(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

export default function SiteTime() {
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
            </li>
          );
        })}
        {users.length === 0 && <li className="text-sm text-gray-500">No users yet.</li>}
      </ul>
    </aside>
  );
}
