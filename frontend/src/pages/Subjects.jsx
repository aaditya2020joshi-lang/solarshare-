import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { BookIcon, TrashIcon } from '../components/icons';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function loadSubjects() {
    return client.get('/subjects').then((res) => setSubjects(res.data.subjects));
  }

  useEffect(() => {
    loadSubjects().finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await client.post('/subjects', { name });
      setName('');
      await loadSubjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create subject.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this subject and all its tests?')) return;
    await client.delete(`/subjects/${id}`);
    loadSubjects();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">Subjects</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Organic Chemistry"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          Add subject
        </button>
      </form>
      {error && <p className="text-sm text-red-600 -mt-6 mb-6">{error}</p>}

      {loading ? (
        <Spinner />
      ) : subjects.length === 0 ? (
        <p className="text-sm text-gray-500">No subjects yet — add one above to get started.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {subjects.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <Link to={`/subjects/${s.id}`} className="flex items-center gap-3 flex-1">
                <BookIcon className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {s.test_count} {s.test_count === 1 ? 'test' : 'tests'}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(s.id)}
                aria-label="Delete subject"
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
