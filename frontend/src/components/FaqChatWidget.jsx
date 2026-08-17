import { useState } from 'react';
import { findAnswer, suggestedQuestions } from '../data/faq';

const FALLBACK =
  "I don't have an answer for that yet. Tap the WhatsApp button below to reach a real person.";

export default function FaqChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm the Sahara Bank FAQ bot. Ask me about the AI Financial Service, loans, or your account." },
  ]);
  const [input, setInput] = useState('');

  function ask(question) {
    if (!question.trim()) return;
    const answer = findAnswer(question) || FALLBACK;
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: question },
      { from: 'bot', text: answer },
    ]);
    setInput('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(input);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-sky-accent text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm">Sahara Bank Help</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 max-h-80 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm ${
                    m.from === 'user' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="text-xs bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-full px-2.5 py-1 hover:bg-brand-100 dark:hover:bg-brand-900/50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-gray-800 p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open help chat"
        className="fixed bottom-5 right-[92px] z-40 w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700 shadow-lg flex items-center justify-center transition text-white"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </>
  );
}
