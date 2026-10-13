import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { NotesIcon } from '../components/icons';

export default function Notes() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/notes/decks')
      .then((res) => setSubjects(res.data.subjects))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Notes</h1>
      <p className="text-sm text-gray-500 mb-6">Pick a subject to read its notes or add new ones.</p>

      {subjects.length === 0 ? (
        <p className="text-sm text-gray-500">
          No subjects yet. <Link to="/subjects" className="text-brand-600 dark:text-brand-400 font-medium">Add a subject</Link>{' '}
          first, then come back for notes.
        </p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {subjects.map((s) => (
            <li key={s.id}>
              <Link
                to={`/notes/${s.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-all"
              >
                <NotesIcon className="w-6 h-6 text-brand-600 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {s.note_count} {s.note_count === 1 ? 'note' : 'notes'}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
