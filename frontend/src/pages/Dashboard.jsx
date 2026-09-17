import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { BookIcon, BellIcon, ClipboardIcon, ClockIcon } from '../components/icons';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/subjects'),
      client.get('/reminders'),
      client.get('/attempts?limit=5'),
    ])
      .then(([subjectsRes, remindersRes, attemptsRes]) => {
        setSubjects(subjectsRes.data.subjects);
        setReminders(remindersRes.data.reminders);
        setAttempts(attemptsRes.data.attempts);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const upcomingReminders = reminders.filter((r) => !r.sent || r.repeat !== 'none').slice(0, 5);
  const testCount = subjects.reduce((sum, s) => sum + s.test_count, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
        Welcome back{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Here's where your studying stands.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <BookIcon className="w-5 h-5 text-brand-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{subjects.length}</div>
          <div className="text-sm text-gray-500">Subjects</div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <ClipboardIcon className="w-5 h-5 text-brand-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{testCount}</div>
          <div className="text-sm text-gray-500">Mock tests</div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <BellIcon className="w-5 h-5 text-brand-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{reminders.length}</div>
          <div className="text-sm text-gray-500">Reminders</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming reminders</h2>
            <Link to="/reminders" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
              Manage
            </Link>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-gray-500">No reminders set yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcomingReminders.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex items-center gap-3"
                >
                  <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{r.title}</div>
                    <div className="text-xs text-gray-500">{formatDateTime(r.remind_at)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent test results</h2>
            <Link to="/subjects" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
              Take a test
            </Link>
          </div>
          {attempts.length === 0 ? (
            <p className="text-sm text-gray-500">No mock tests taken yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {attempts.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/attempts/${a.id}`}
                    className="block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:border-brand-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{a.test_title}</div>
                        <div className="text-xs text-gray-500">{a.subject_name}</div>
                      </div>
                      <div className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {a.score}/{a.total}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
