const faq = [
  {
    keywords: ['ai financial service', 'ai', 'insights', 'budgeting', 'savings insights'],
    answer:
      "Our AI Financial Service looks at your spending and saving patterns and gives you personalized insights and budgeting nudges — so you can catch issues and opportunities before they become problems.",
  },
  {
    keywords: ['payment failure', 'failed payment', 'stuck payment', 'support', 'help'],
    answer:
      "If a payment fails or gets stuck, our Good Payment Failure Support team actively tracks it down and resolves it, instead of leaving you to guess where your money went.",
  },
  {
    keywords: ['ai support', 'financial literacy', 'literacy', 'learn about money', 'education'],
    answer:
      "AI Support is our financial literacy feature — ask it anything about budgeting, saving, credit, or loans in plain language, and get personalized lessons based on your own spending patterns, any time.",
  },
  {
    keywords: ['micro loan', 'micro loans', 'small loan', 'low interest', 'interest rate'],
    answer:
      "Micro loans are small-amount loans, approved fast, designed to help you cover day-to-day needs — and they come with a lower interest rate than a typical personal loan.",
  },
  {
    keywords: ['sign up', 'signup', 'register', 'open account', 'account'],
    answer:
      'Click "Open an Account" in the top right and fill in your details. Already have an account? Use "Log in" instead.',
  },
  {
    keywords: ['login', 'log in', 'sign in'],
    answer: 'Click "Log In" in the navigation bar and enter your email and password.',
  },
  {
    keywords: ['dashboard', 'balance', 'statements', 'transfers'],
    answer:
      'Your Dashboard is where your account overview lives. Full account features like balance, transfers, cards, and loans are coming soon to this demo.',
  },
  {
    keywords: ['security', 'secure', 'safe', 'safety'],
    answer:
      'Sahara Bank uses bank-grade security on every transaction, with your account accessible anytime, anywhere.',
  },
  {
    keywords: ['about', 'sahara', 'who are you', 'what is sahara'],
    answer:
      'Sahara Bank is a demo banking experience built around AI-driven financial insights, fast and honest payment support, low-interest micro loans, and AI Support to help raise financial literacy.',
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
  'What is the AI Financial Service?',
  'What is AI Support?',
  'What is a Micro Loan?',
  'What happens if a payment fails?',
];

export default faq;
