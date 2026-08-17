import BarChart from '../components/BarChart';

const SPENDING = [
  { label: 'Rent', value: 18000 },
  { label: 'Groceries', value: 6200 },
  { label: 'Transport', value: 2400 },
  { label: 'Dining', value: 3100 },
  { label: 'Savings', value: 9000 },
];

const TIPS = [
  {
    icon: '📊',
    title: 'Dining spend is up 18% this month',
    detail:
      "You've spent more on dining out compared to your usual monthly average. Consider setting a soft budget of ₹2,500 to stay on track.",
  },
  {
    icon: '💰',
    title: 'Idle balance could be earning more',
    detail:
      'You have funds sitting in your account that could be automatically swept into a higher-yield savings option each month.',
  },
  {
    icon: '🔁',
    title: 'A recurring charge looks new',
    detail:
      'A subscription payment appeared for the first time this month. Worth a quick check if you recognize it.',
  },
];

export default function Insights() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Financial Service</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Personalized insights into your spending and saving, powered by AI.
      </p>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">This month's spending</h2>
        <BarChart data={SPENDING} formatValue={(v) => `₹${v.toLocaleString('en-IN')}`} />
      </div>

      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">AI insights for you</h2>
      <div className="grid sm:grid-cols-3 gap-6 mb-6">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 dark:from-brand-900/50 dark:to-sky-900/50 flex items-center justify-center text-2xl mb-4">
              {tip.icon}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{tip.detail}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
        Illustrative data for this demo — not your actual transaction history.
      </p>
    </div>
  );
}
