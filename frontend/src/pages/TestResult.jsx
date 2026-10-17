import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import { computeStreak, playFanfare, setSoundEnabled, soundEnabled } from '../utils/celebrate';
import { CheckIcon, XIcon } from '../components/icons';

function praise(percent) {
  if (percent === 100) return { emoji: '🏆', title: 'Perfect score!', text: 'Every single answer right. You are unstoppable!', party: 120 };
  if (percent >= 90) return { emoji: '🎉', title: 'Congratulations!', text: 'Outstanding work. You really know this topic.', party: 100 };
  if (percent >= 75) return { emoji: '🌟', title: 'Great job!', text: 'Strong result. A little more polish and you will be at the top.', party: 60 };
  if (percent >= 60) return { emoji: '👍', title: 'Good effort!', text: 'Solid score. Review the ones you missed and try again.', party: 0 };
  if (percent >= 40) return { emoji: '💪', title: 'Keep going!', text: 'You are getting there. Read the explanations below and retake it.', party: 0 };
  return { emoji: '🌱', title: "Don't give up!", text: 'Every expert started here. Go through the notes, then try again.', party: 0 };
}

export default function TestResult() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [soundOn, setSoundOn] = useState(soundEnabled());

  useEffect(() => {
    client.get(`/attempts/${id}`).then((res) => {
      setAttempt(res.data.attempt);
      setQuestions(res.data.questions);
      setLoading(false);
    });
    client
      .get('/attempts/streak')
      .then((res) => setStreak(computeStreak(res.data.times)))
      .catch(() => {});
  }, [id]);

  // A short fanfare for a perfect score, only if sound is switched on.
  useEffect(() => {
    if (attempt && attempt.total > 0 && attempt.score === attempt.total && soundEnabled()) playFanfare();
  }, [attempt]);

  function toggleSound() {
    setSoundEnabled(!soundOn);
    setSoundOn(!soundOn);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!attempt) return <p className="text-center py-24 text-gray-500">Result not found.</p>;

  const percent = Math.round((attempt.score / attempt.total) * 100);
  const mood = praise(percent);
  let personalBest = '';
  if (attempt.earlier_attempts === 0) personalBest = '📌 First attempt — this is your starting score';
  else if (attempt.previous_best_percent !== null && percent > attempt.previous_best_percent)
    personalBest = `📈 New personal best! Up from ${attempt.previous_best_percent}%`;
  else if (attempt.previous_best_percent !== null && percent === attempt.previous_best_percent)
    personalBest = '🎯 You matched your personal best';
  else if (attempt.previous_best_percent !== null) personalBest = `Your best on this test is ${attempt.previous_best_percent}%`;

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
        <div className="mt-6 rounded-2xl border border-brand-200 dark:border-gray-700 bg-brand-50 dark:bg-gray-900 px-5 py-4">
          <div className="text-4xl mb-1" role="img" aria-label="celebration">
            {mood.emoji}
          </div>
          <div className="text-lg font-display font-bold text-gray-900 dark:text-white">{mood.title}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{mood.text}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs font-medium">
            {personalBest && (
              <span className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1">
                {personalBest}
              </span>
            )}
            {streak > 0 && (
              <span className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1">
                🔥 {streak}-day streak{streak > 1 ? ' — keep it going!' : ' — come back tomorrow to grow it'}
              </span>
            )}
            <button
              type="button"
              onClick={toggleSound}
              className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 text-gray-500"
            >
              {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
            </button>
          </div>
        </div>
      </div>
      {mood.party > 0 && <Confetti pieces={mood.party} />}

      {attempt.test_id && (
        <div className="mb-8">
          <Leaderboard url={`/leaderboard/test/${attempt.test_id}`} title="Leaderboard for this test" mode="test" />
        </div>
      )}

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
