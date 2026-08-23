const faq = [
  {
    keywords: ['what is human insights', 'about', 'what is this', 'purpose'],
    answer:
      'Human Insights is a place to ask questions and get clear, straightforward answers — no digging through pages of documentation.',
  },
  {
    keywords: ['sign up', 'signup', 'register', 'create account', 'account'],
    answer:
      'Click "Sign up" in the top right and fill in your details. Already have an account? Use "Log in" instead.',
  },
  {
    keywords: ['login', 'log in', 'sign in'],
    answer: 'Click "Log in" in the navigation bar and enter your email and password.',
  },
  {
    keywords: ['ask', 'question', 'how does this work', 'how do i ask'],
    answer:
      'Type your question into the box on the homepage (or here in this chat) and press Ask — a matching answer shows up right away.',
  },
];

export function findAnswer(message) {
  const lower = message.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const entry of faq) {
    // Word-boundary match (so "sell" doesn't false-match inside "seller"),
    // weighted by keyword length so more specific phrases outrank generic words.
    const score = entry.keywords.reduce((sum, keyword) => {
      const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return pattern.test(lower) ? sum + keyword.length : sum;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best ? best.answer : null;
}

export const suggestedQuestions = [
  'What is Human Insights?',
  'How do I ask a question?',
  'How do I sign up?',
];

export default faq;
