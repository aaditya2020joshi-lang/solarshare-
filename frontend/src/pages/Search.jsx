import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/icons';

const inputClass =
  'rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';

function Section({ title, count, children }) {
  if (!count) return null;
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title} ({count})
      </h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </section>
  );
}

const cardClass = 'rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-sm';

export default function Search() {
  const [query, setQuery] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');

  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/subjects').then((res) => setSubjects(res.data.subjects));
  }, []);

  function reset() {
    setError('');
    setResults(null);
    setAnswer('');
  }

  async function handleSearch(e) {
    e?.preventDefault();
    reset();
    if (query.trim().length < 2) {
      setError('Type at least 2 characters to search.');
      return;
    }
    setSearching(true);
    try {
      const params = { q: query.trim() };
      if (subjectId) params.subject_id = subjectId;
      const res = await client.get('/search', { params });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed.');
    } finally {
      setSearching(false);
    }
  }

  async function handleAsk() {
    reset();
    if (query.trim().length < 3) {
      setError('Type your doubt first.');
      return;
    }
    setAsking(true);
    try {
      const res = await client.post('/ask', {
        question: query.trim(),
        subject_id: subjectId ? Number(subjectId) : undefined,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not get an answer.');
    } finally {
      setAsking(false);
    }
  }

  const total = results
    ? results.subjects.length + results.tests.length + results.questions.length + results.flashcards.length
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">Search</h1>
      <p className="text-sm text-gray-500 mb-6">
        Search your own subjects, tests, questions and flash cards, or ask a doubt and get an explanation.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 mb-6">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="Search for a topic, or type your doubt here"
          className={`${inputClass} w-full`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass}>
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={searching || asking}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
          >
            <SearchIcon className="w-4 h-4" /> Search
          </button>
          <button
            type="button"
            onClick={handleAsk}
            disabled={searching || asking}
            className="border border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold px-4 py-2 rounded-lg hover:bg-brand-50 dark:hover:bg-gray-800 transition-all disabled:opacity-60"
          >
            Ask a doubt
          </button>
        </div>
      </form>

      {(searching || asking) && (
        <div className="py-6">
          <Spinner label={asking ? 'Thinking…' : 'Searching…'} />
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {answer && (
        <div className="rounded-xl border border-brand-200 dark:border-gray-700 bg-brand-50 dark:bg-gray-900 p-4 mb-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-2">
            Answer
          </div>
          <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      {results && total === 0 && <p className="text-sm text-gray-500">Nothing found. Try a different word.</p>}

      {results && (
        <>
          <Section title="Subjects" count={results.subjects.length}>
            {results.subjects.map((s) => (
              <li key={s.id} className={cardClass}>
                <Link to={`/subjects/${s.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                  {s.name}
                </Link>
              </li>
            ))}
          </Section>

          <Section title="Tests" count={results.tests.length}>
            {results.tests.map((t) => (
              <li key={t.id} className={cardClass}>
                <Link to={`/tests/${t.id}/take`} className="font-medium text-brand-600 dark:text-brand-400">
                  {t.title}
                </Link>
                <div className="text-xs text-gray-500">{t.subject_name}</div>
              </li>
            ))}
          </Section>

          <Section title="Questions" count={results.questions.length}>
            {results.questions.map((q) => (
              <li key={q.id} className={cardClass}>
                <div className="font-medium text-gray-900 dark:text-white">{q.question_text}</div>
                <div className="text-green-700 dark:text-green-400 mt-1">Answer: {q.answer}</div>
                {q.explanation && <div className="text-gray-500 mt-1">{q.explanation}</div>}
                <div className="text-xs text-gray-400 mt-1">
                  {q.subject_name} · {q.test_title}
                </div>
              </li>
            ))}
          </Section>

          <Section title="Flash cards" count={results.flashcards.length}>
            {results.flashcards.map((f) => (
              <li key={f.id} className={cardClass}>
                <div className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{f.front}</div>
                <div className="text-gray-500 whitespace-pre-wrap">{f.back}</div>
                <Link to={`/flashcards/${f.subject_id}`} className="text-xs text-brand-600 dark:text-brand-400">
                  {f.subject_name}
                </Link>
              </li>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}
