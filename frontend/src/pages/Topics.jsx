import { topics } from '../data/faq';

export default function Topics() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Topics</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Every topic covered so far, with all of its alternatives — no need to ask, just browse.
      </p>

      <div className="space-y-6">
        {topics.map((topic) => (
          <div
            key={topic.title}
            className="bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-700 rounded-lg p-6"
          >
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">{topic.title}</h2>
            <ul className="space-y-2">
              {topic.items.map((item) => (
                <li key={item} className="flex gap-2 text-gray-800 dark:text-gray-200 leading-relaxed">
                  <span className="text-brand-600 dark:text-brand-400 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
        More topics are on the way — this list grows as more get added.
      </p>
    </div>
  );
}
