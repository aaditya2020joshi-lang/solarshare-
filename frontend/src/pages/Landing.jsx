import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findAnswer, suggestedQuestions } from '../data/faq';

const FALLBACK =
  "I don't have an answer for that yet — more questions and answers are being added soon.";

export default function Landing() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [askedQuestion, setAskedQuestion] = useState('');

  function ask(q) {
    if (!q.trim()) return;
    setAnswer(findAnswer(q) || FALLBACK);
    setAskedQuestion(q);
    setQuestion('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(question);
  }

  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 bg-brand-200 dark:bg-brand-900/40 rounded-full blur-3xl opacity-50 animate-blob"
          aria-hidden="true"
        />
        <div
          className="absolute top-10 -right-24 w-96 h-96 bg-sky-200 dark:bg-sky-900/30 rounded-full blur-3xl opacity-50 animate-blob-delay"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto px-4 py-24 text-center animate-fade-in-up">
          <p className="inline-block bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-semibold px-3 py-1 rounded-full mb-5">
            Human Insights
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Ask a question.{' '}
            <span className="bg-gradient-to-r from-brand-600 to-sky-accent bg-clip-text text-transparent">
              Get an answer.
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-10">
            Type your question below and get a clear, straightforward answer back — no digging
            around required.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-7 py-3 rounded-full shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Ask
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 hover:bg-brand-50 dark:hover:bg-gray-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {answer && (
            <div className="text-left bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 animate-fade-in-up">
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-2">
                {askedQuestion}
              </p>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{answer}</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link
              to="/signup"
              className="bg-white dark:bg-gray-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-gray-700 font-semibold px-7 py-3 rounded-full hover:bg-brand-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 transition-all"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="text-gray-500 dark:text-gray-400 font-semibold px-7 py-3 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          More questions and answers are on the way — this is an early look at Human Insights.
        </p>
      </section>
    </div>
  );
}
