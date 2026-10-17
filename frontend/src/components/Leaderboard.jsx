import { useEffect, useState } from 'react';
import client from '../api/client';

const MEDALS = ['🥇', '🥈', '🥉'];

// Shows a ranked list and keeps itself fresh: it reloads every 30 seconds and when the tab regains focus.
export default function Leaderboard({ url, title, mode = 'overall' }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    function load() {
      client
        .get(url)
        .then((res) => {
          if (alive) {
            setData(res.data);
            setFailed(false);
          }
        })
        .catch(() => alive && setFailed(true));
    }
    load();
    const timer = setInterval(load, 30000);
    window.addEventListener('focus', load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, [url]);

  const isTest = mode === 'test';
  const meInList = data?.leaders.some((l) => l.is_me);

  function row(l) {
    return (
      <tr
        key={l.user_id}
        className={l.is_me ? 'bg-brand-50 dark:bg-gray-800 font-semibold' : 'border-t border-gray-100 dark:border-gray-800'}
      >
        <td className="py-2 pl-3 pr-2 w-12">{MEDALS[l.rank - 1] || `#${l.rank}`}</td>
        <td className="py-2 pr-2 text-gray-900 dark:text-white">
          {l.name}
          {l.is_me && <span className="ml-1 text-xs text-brand-600 dark:text-brand-400">(you)</span>}
        </td>
        {isTest ? (
          <>
            <td className="py-2 pr-2 text-right">
              {l.score}/{l.total}
            </td>
            <td className="py-2 pr-3 text-right text-brand-600 dark:text-brand-400">{l.percent}%</td>
          </>
        ) : (
          <>
            <td className="py-2 pr-2 text-right hidden sm:table-cell">{l.tests_done}</td>
            <td className="py-2 pr-2 text-right">{l.avg_percent}%</td>
            <td className="py-2 pr-3 text-right text-brand-600 dark:text-brand-400">{l.points}</td>
          </>
        )}
      </tr>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {data && <span className="text-xs text-gray-500">{data.participants} on the board · updates live</span>}
      </div>
      {failed && !data && <p className="text-sm text-gray-500">The leaderboard is not available right now.</p>}
      {data && data.leaders.length === 0 && (
        <p className="text-sm text-gray-500">No scores yet. Finish a test to take the first spot.</p>
      )}
      {data && data.leaders.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-gray-500 bg-gray-50 dark:bg-gray-950">
              <tr>
                <th className="py-2 pl-3 pr-2 text-left">Rank</th>
                <th className="py-2 pr-2 text-left">Name</th>
                {isTest ? (
                  <>
                    <th className="py-2 pr-2 text-right">Score</th>
                    <th className="py-2 pr-3 text-right">%</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 pr-2 text-right hidden sm:table-cell">Tests</th>
                    <th className="py-2 pr-2 text-right">Avg</th>
                    <th className="py-2 pr-3 text-right">Points</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.leaders.map(row)}
              {data.me && !meInList && (
                <>
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 text-xs py-1">
                      …
                    </td>
                  </tr>
                  {row({ ...data.me, is_me: true })}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
      {!isTest && (
        <p className="text-xs text-gray-500 mt-2">Points = your best percentage on each test, added up. Retakes only count if you beat your best.</p>
      )}
    </section>
  );
}
