import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { TrashIcon, CheckIcon } from '../components/icons';

const EMPTY_OPTIONS = ['', '', '', ''];

export default function TestBuilder() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    return client.get(`/tests/${id}`).then((res) => {
      setTest(res.data.test);
      setQuestions(res.data.questions);
    });
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  function updateOption(i, value) {
    setOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    const cleaned = options.map((o) => o.trim());
    const nonEmptyIndices = cleaned.reduce((acc, o, i) => (o ? [...acc, i] : acc), []);
    const trimmedOptions = nonEmptyIndices.map((i) => cleaned[i]);
    const newCorrectIndex = nonEmptyIndices.indexOf(correctIndex);

    if (!questionText.trim() || trimmedOptions.length < 2) {
      setError('Add a question and at least two options.');
      return;
    }
    if (newCorrectIndex === -1) {
      setError('The option marked correct cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await client.post(`/tests/${id}/questions`, {
        question_text: questionText,
        options: trimmedOptions,
        correct_index: newCorrectIndex,
        explanation,
      });
      setQuestionText('');
      setOptions(EMPTY_OPTIONS);
      setCorrectIndex(0);
      setExplanation('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add question.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteQuestion(questionId) {
    await client.delete(`/tests/${id}/questions/${questionId}`);
    load();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!test) return <p className="text-center py-24 text-gray-500">Test not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to={`/subjects/${test.subject_id}`} className="text-sm text-brand-600 dark:text-brand-400 font-medium">
        ← Back to subject
      </Link>
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-2 mb-6">
        Edit questions — {test.title}
      </h1>

      <form
        onSubmit={handleAddQuestion}
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 mb-8 flex flex-col gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                title="Mark as correct answer"
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 -mt-2">Select the radio button next to the correct option.</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Explanation (optional)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          Add question
        </button>
      </form>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Questions ({questions.length})
      </h2>
      {questions.length === 0 ? (
        <p className="text-sm text-gray-500">No questions yet — add your first one above.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                    {i + 1}. {q.question_text}
                  </div>
                  <ul className="flex flex-col gap-1">
                    {q.options.map((opt, oi) => (
                      <li
                        key={oi}
                        className={`text-sm flex items-center gap-2 ${
                          oi === q.correct_index ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {oi === q.correct_index && <CheckIcon className="w-3.5 h-3.5" />}
                        {opt}
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <p className="text-xs text-gray-500 mt-2 italic">{q.explanation}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  aria-label="Delete question"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
