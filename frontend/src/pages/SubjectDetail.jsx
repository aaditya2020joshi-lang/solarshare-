import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { ClipboardIcon, ClockIcon, TrashIcon } from '../components/icons';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    return client.get(`/subjects/${id}`).then((res) => {
      setSubject(res.data.subject);
      setTests(res.data.tests);
    });
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  async function handleCreateTest(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await client.post(`/subjects/${id}/tests`, { title, duration_minutes: duration });
      setTitle('');
      setDuration(30);
      navigate(`/tests/${res.data.testId}/edit`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create test.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTest(testId) {
    if (!confirm('Delete this test and all its questions?')) return;
    await client.delete(`/tests/${testId}`);
    load();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!subject) {
    return <p className="text-center py-24 text-gray-500">Subject not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/subjects" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
        ← All subjects
      </Link>
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-2 mb-6">{subject.name}</h1>

      <form onSubmit={handleCreateTest} className="flex flex-wrap gap-2 mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Test title, e.g. Chapter 3 Mock Test"
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-28 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          Create test
        </button>
      </form>
      {error && <p className="text-sm text-red-600 -mt-6 mb-6">{error}</p>}

      {tests.length === 0 ? (
        <p className="text-sm text-gray-500">No tests yet — create one above, then add questions to it.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tests.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ClipboardIcon className="w-5 h-5 text-brand-600 shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" /> {t.duration_minutes} min · {t.question_count}{' '}
                      {t.question_count === 1 ? 'question' : 'questions'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTest(t.id)}
                  aria-label="Delete test"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
              <div className="flex gap-3 text-sm font-medium">
                <Link to={`/tests/${t.id}/edit`} className="text-brand-600 dark:text-brand-400">
                  Edit questions
                </Link>
                {t.question_count > 0 && (
                  <Link to={`/tests/${t.id}/take`} className="text-brand-600 dark:text-brand-400">
                    Take test
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
