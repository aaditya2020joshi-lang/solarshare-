import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { TrashIcon } from '../components/icons';

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function FlashcardDeck() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkError, setBulkError] = useState('');

  const [order, setOrder] = useState([]);
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);

  function load() {
    return client
      .get('/flashcards', { params: { subject_id: subjectId } })
      .then((res) => {
        setSubject(res.data.subject);
        setCards(res.data.cards);
      })
      .catch(() => setNotFound(true));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [subjectId]);

  // Keep the study order in sync with the cards, but don't reshuffle on every render.
  useEffect(() => {
    setOrder((prev) => {
      const ids = cards.map((c) => c.id);
      const kept = prev.filter((id) => ids.includes(id));
      const added = ids.filter((id) => !kept.includes(id));
      return [...kept, ...added];
    });
  }, [cards]);

  useEffect(() => {
    if (position >= order.length) setPosition(Math.max(0, order.length - 1));
  }, [order, position]);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const current = order.length ? byId.get(order[position]) : null;

  function go(delta) {
    if (!order.length) return;
    setFlipped(false);
    setPosition((p) => (p + delta + order.length) % order.length);
  }

  function handleShuffle() {
    setOrder((prev) => shuffled(prev));
    setPosition(0);
    setFlipped(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      await client.post('/flashcards', { subject_id: Number(subjectId), front, back });
      setFront('');
      setBack('');
      await load();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Could not add the card.');
    } finally {
      setAdding(false);
    }
  }

  async function handleBulk(e) {
    e.preventDefault();
    setBulkError('');
    setBulkMessage('');
    const parsed = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const at = line.indexOf('|');
        return at === -1 ? { front: line, back: '' } : { front: line.slice(0, at), back: line.slice(at + 1) };
      });
    if (parsed.length === 0) return;
    try {
      const res = await client.post('/flashcards/bulk', { subject_id: Number(subjectId), cards: parsed });
      setBulkMessage(`Added ${res.data.added} ${res.data.added === 1 ? 'card' : 'cards'}.`);
      setBulkText('');
      await load();
    } catch (err) {
      setBulkError(err.response?.data?.error || 'Could not add the cards.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this card?')) return;
    await client.delete(`/flashcards/${id}`);
    setFlipped(false);
    load();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (notFound || !subject) {
    return <p className="text-center py-24 text-gray-500">Subject not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/flashcards" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
        ← All decks
      </Link>
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-2 mb-6">{subject.name}</h1>

      {current ? (
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label="Flip card"
            className="w-full min-h-[200px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all p-8 flex flex-col items-center justify-center text-center"
          >
            <span className="text-xs uppercase tracking-wide text-gray-400 mb-3">{flipped ? 'Answer' : 'Question'}</span>
            <span className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap">
              {flipped ? current.back : current.front}
            </span>
            <span className="text-xs text-gray-400 mt-4">Tap the card to flip</span>
          </button>
          <div className="flex items-center justify-between mt-3">
            <button type="button" onClick={() => go(-1)} className="text-sm font-medium text-brand-600 dark:text-brand-400">
              ← Previous
            </button>
            <span className="text-sm text-gray-500">
              {position + 1} / {order.length}
            </span>
            <button type="button" onClick={() => go(1)} className="text-sm font-medium text-brand-600 dark:text-brand-400">
              Next →
            </button>
          </div>
          <div className="text-center mt-2">
            <button type="button" onClick={handleShuffle} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Shuffle
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-8">No cards in this deck yet. Add your first one below.</p>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-3">
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          rows={2}
          placeholder="Front (question or term)"
          className={inputClass}
        />
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          rows={2}
          placeholder="Back (answer or meaning)"
          className={inputClass}
        />
        {addError && <p className="text-sm text-red-600">{addError}</p>}
        <button
          type="submit"
          disabled={adding}
          className="self-start bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          Add card
        </button>
      </form>

      <div className="mb-8">
        <button
          type="button"
          onClick={() => setShowBulk((v) => !v)}
          className="text-sm font-medium text-brand-600 dark:text-brand-400"
        >
          {showBulk ? 'Hide bulk add' : 'Add many cards at once'}
        </button>
        {showBulk && (
          <form onSubmit={handleBulk} className="mt-3 flex flex-col gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              One card per line, with the front and back separated by a <code>|</code>. For example:{' '}
              <code>Debit | Left side of an account</code>
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={6}
              className={`${inputClass} font-mono text-xs`}
            />
            {bulkError && <p className="text-sm text-red-600">{bulkError}</p>}
            {bulkMessage && <p className="text-sm text-green-600">{bulkMessage}</p>}
            <button
              type="submit"
              disabled={!bulkText.trim()}
              className="self-start bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
            >
              Add cards
            </button>
          </form>
        )}
      </div>

      {cards.length > 0 && (
        <ul className="flex flex-col gap-2">
          {cards.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
            >
              <div className="text-sm min-w-0">
                <div className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{c.front}</div>
                <div className="text-gray-500 whitespace-pre-wrap">{c.back}</div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                aria-label="Delete card"
                className="p-1 text-gray-400 hover:text-red-600 transition-colors shrink-0"
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
