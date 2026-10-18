import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { SearchIcon } from '../components/icons';

const LABEL = { note: 'From your notes', flashcard: 'Flash card', question: 'From a practice question' };

export default function AskSyllabus() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');

  async function search(e) {
    e.preventDefault();
    setError('');
    setAiAnswer('');
    if (query.trim().length < 3) {
      setError('Type your question first.');
      return;
    }
    setLoading(true);
    try {
      const res = await client.get('/syllabus-search', { params: { q: query.trim() } });
      setResults(res.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function explain() {
    setAiLoading(true);
    setAiAnswer('');
    try {
      const res = await client.post('/ask', { question: query.trim() });
      setAiAnswer(res.data.answer);
    } catch (err) {
      setAiAnswer(err.response?.data?.error || 'Could not get an explanation right now.');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <section className="mb-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Ask your syllabus</h2>
      <p className="text-sm text-gray-500 mb-3">
        Type any question or topic. No need to pick a subject — it searches every subject's notes, flash cards and practice
        questions.
      </p>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What is the law of equi-marginal utility?"
          className="flex-1 min-w-0 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          <SearchIcon className="w-4 h-4" /> {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {results && (
        <div className="mt-4 flex flex-col gap-3">
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing found in your syllabus. Try different words.</p>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                  <span className="rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 px-2 py-0.5 font-medium">
                    {r.subject_name}
                  </span>
                  <span className="text-gray-500">{LABEL[r.type]}</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">{r.title}</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{r.text}</p>
                {r.type === 'note' && r.subject_id && (
                  <Link
                    to={`/notes/${r.subject_id}`}
                    className="inline-block text-xs text-brand-600 dark:text-brand-400 font-medium mt-2"
                  >
                    Open the full notes
                  </Link>
                )}
              </div>
            ))
          )}
          <div>
            <button
              type="button"
              onClick={explain}
              disabled={aiLoading}
              className="text-sm font-medium text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 rounded-lg px-3 py-1.5 hover:bg-brand-50 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              {aiLoading ? 'Thinking…' : 'Not enough? Get a full explanation'}
            </button>
            {aiAnswer && (
              <p className="mt-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                {aiAnswer}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
