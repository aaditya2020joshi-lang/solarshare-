import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { CardsIcon } from '../components/icons';

export default function Flashcards() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/flashcards/decks')
      .then((res) => setDecks(res.data.decks))
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
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Flash Cards</h1>
      <p className="text-sm text-gray-500 mb-6">Pick a subject to study its cards or add new ones.</p>

      {decks.length === 0 ? (
        <p className="text-sm text-gray-500">
          No subjects yet. <Link to="/subjects" className="text-brand-600 dark:text-brand-400 font-medium">Add a subject</Link>{' '}
          first, then come back to make cards.
        </p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {decks.map((d) => (
            <li key={d.id}>
              <Link
                to={`/flashcards/${d.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-all"
              >
                <CardsIcon className="w-6 h-6 text-brand-600 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{d.name}</div>
                  <div className="text-xs text-gray-500">
                    {d.card_count} {d.card_count === 1 ? 'card' : 'cards'}
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
