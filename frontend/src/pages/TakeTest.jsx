import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startedAtRef = useRef(null);
  const submittedRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const answerArray = questions.map((_, i) => (answers[i] !== undefined ? answers[i] : -1));
    try {
      const res = await client.post(`/tests/${id}/attempts`, {
        answers: answerArray,
        started_at: startedAtRef.current,
      });
      navigate(`/attempts/${res.data.attemptId}`);
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [answers, questions, id, navigate]);

  useEffect(() => {
    client.get(`/tests/${id}/take`).then((res) => {
      setTest(res.data.test);
      setQuestions(res.data.questions);
      setSecondsLeft(res.data.test.duration_minutes * 60);
      startedAtRef.current = new Date().toISOString();
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (loading || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [loading, secondsLeft]);

  useEffect(() => {
    if (!loading && secondsLeft === 0) handleSubmit();
  }, [loading, secondsLeft, handleSubmit]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (questions.length === 0) {
    return <p className="text-center py-24 text-gray-500">This test has no questions yet.</p>;
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 sticky top-16 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur py-2 z-10">
        <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">{test.title}</h1>
        <div
          className={`font-mono text-lg font-semibold ${secondsLeft < 60 ? 'text-red-600' : 'text-brand-600 dark:text-brand-400'}`}
        >
          {formatTime(secondsLeft)}
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {answeredCount} of {questions.length} answered
      </p>

      <div className="flex flex-col gap-6">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
          >
            <div className="font-medium text-gray-900 dark:text-white mb-3">
              {i + 1}. {q.question_text}
            </div>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    answers[i] === oi
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${i}`}
                    checked={answers[i] === oi}
                    onChange={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 w-full bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit test'}
      </button>
    </div>
  );
}
