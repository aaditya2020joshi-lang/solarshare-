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
      <section className="relative bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div
          className="absolute inset-0 text-gray-200 dark:text-gray-800 bg-dot-grid opacity-60"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto px-4 py-24 text-center animate-fade-in-up">
          <p className="inline-block border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md mb-6">
            Human Insights
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Ask a question.
            <br />
            <span className="text-brand-600 dark:text-brand-400">Get an answer.</span>
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
              className="flex-1 border-2 border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="bg-gray-900 dark:bg-brand-600 text-white font-bold px-7 py-3 rounded-lg hard-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Ask
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="text-xs font-medium bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 hover:border-gray-900 dark:hover:border-gray-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {answer && (
            <div className="text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 border-l-brand-600 rounded-lg p-6 animate-fade-in-up">
              <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-2">
                {askedQuestion}
              </p>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{answer}</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link
              to="/signup"
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-900 dark:border-gray-100 font-bold px-7 py-3 rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-colors"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="text-gray-500 dark:text-gray-400 font-bold px-7 py-3 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          More questions and answers are on the way — this is an early look at Human Insights.
        </p>
      </section>
    </div>
  );
}
