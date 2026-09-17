import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { CheckIcon, XIcon } from '../components/icons';

export default function TestResult() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/attempts/${id}`).then((res) => {
      setAttempt(res.data.attempt);
      setQuestions(res.data.questions);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!attempt) return <p className="text-center py-24 text-gray-500">Result not found.</p>;

  const percent = Math.round((attempt.score / attempt.total) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
        ← Dashboard
      </Link>

      <div className="text-center my-8">
        <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">{attempt.test_title}</h1>
        <div className="text-5xl font-bold bg-gradient-to-r from-brand-600 to-sky-accent bg-clip-text text-transparent">
          {attempt.score}/{attempt.total}
        </div>
        <p className="text-gray-500 mt-1">{percent}% correct</p>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, i) => {
          const correct = q.selected_index === q.correct_index;
          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 bg-white dark:bg-gray-900 ${
                correct ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'
              }`}
            >
              <div className="flex items-start gap-2 mb-3">
                {correct ? (
                  <CheckIcon className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                ) : (
                  <XIcon className="w-4 h-4 text-red-600 mt-1 shrink-0" />
                )}
                <div className="font-medium text-gray-900 dark:text-white">
                  {i + 1}. {q.question_text}
                </div>
              </div>
              <ul className="flex flex-col gap-1 ml-6">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correct_index;
                  const isSelected = oi === q.selected_index;
                  return (
                    <li
                      key={oi}
                      className={`text-sm ${
                        isCorrect
                          ? 'text-green-600 dark:text-green-400 font-medium'
                          : isSelected
                          ? 'text-red-600 dark:text-red-400 line-through'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {opt}
                      {isCorrect ? ' (correct)' : isSelected ? ' (your answer)' : ''}
                    </li>
                  );
                })}
              </ul>
              {q.explanation && (
                <p className="text-xs text-gray-500 mt-3 ml-6 italic">{q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
