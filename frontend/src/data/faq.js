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
    keywords: ['zero friction', 'zero-friction', 'loan', 'instant loan', 'borrow'],
    answer:
      "Zero-Friction Loans need no paperwork and no external credit check — approval happens in under a second, and if you swipe your card short on cash, the loan kicks in automatically to cover it.",
  },
  {
    keywords: ['no liquidation', 'liquidation', 'sell investments', 'collateral', 'mutual funds', 'digital gold'],
    answer:
      "With No Liquidation, you borrow against your existing investments (like mutual funds or digital gold) without selling them. They stay invested, keep earning, and you avoid early-exit penalties and taxes — we simply hold them as collateral until the loan is repaid.",
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
      'Sahara Bank is a demo banking experience built around AI-driven financial insights, fast and honest payment support, and friction-free borrowing against your existing assets.',
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
  'What is a Zero-Friction Loan?',
  'How does No Liquidation work?',
  'What is a Micro Loan?',
];

export default faq;
