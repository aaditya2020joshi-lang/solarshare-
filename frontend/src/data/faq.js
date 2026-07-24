const faq = [
  {
    keywords: ['price', 'pricing', 'cost', 'rate', 'kwh cost'],
    answer:
      "Sellers set a standard price per kWh, and can optionally offer a discounted \"community price\" for buyers with the Community Priority flag. You'll always see whichever price applies to you before sending a request.",
  },
  {
    keywords: ['community priority', 'priority', 'low income', 'underserved', 'discount'],
    answer:
      "Community Priority is a self-declared flag for buyers from low-income or underserved areas. It surfaces your requests higher in sellers' queues and automatically matches you to any discounted community pricing a seller offers. No verification is required.",
  },
  {
    keywords: ['sell', 'seller', 'list energy', 'create listing', 'post listing'],
    answer:
      "Sign up as a Seller, then go to \"New Listing\" to list your available kWh, standard price, an optional community price, your location, and an availability window.",
  },
  {
    keywords: ['buy', 'buyer', 'purchase', 'browse'],
    answer:
      'Sign up as a Buyer, browse listings, and click "Request Energy" on any listing to send a request to the seller.',
  },
  {
    keywords: ['request', 'accept', 'decline', 'pending'],
    answer:
      "After you send a request, the seller can Accept or Decline it from their Requests page. Once accepted, it shows up in both dashboards as a completed transaction. You can cancel a pending request any time before the seller responds.",
  },
  {
    keywords: ['message', 'messaging', 'chat', 'contact seller', 'contact buyer', 'talk to'],
    answer:
      "Yes — once a request exists, both sides can click \"Message\" on that request to chat directly and coordinate pickup/delivery details.",
  },
  {
    keywords: ['payment', 'pay', 'money', 'transfer'],
    answer:
      "SolarShare connects buyers and sellers and tracks the agreed price, but payment and energy transfer happen directly between you, outside the app.",
  },
  {
    keywords: ['sdg', 'mission', 'why', 'about', 'goal'],
    answer:
      "SolarShare supports UN Sustainable Development Goal 7 — affordable, reliable, clean energy for all. Unlike platforms that optimize purely for trading efficiency, we prioritize energy access for underserved communities through the Community Priority system.",
  },
  {
    keywords: ['sign up', 'signup', 'register', 'account', 'login', 'log in'],
    answer:
      'Click "Sign up" in the top right, choose Buyer or Seller, and fill in your details. Already have an account? Use "Log in" instead.',
  },
  {
    keywords: ['dashboard', 'earnings', 'spending', 'savings', 'history'],
    answer:
      'Your Dashboard shows total energy sold/bought, earnings/spending, a trend chart over time, and (for buyers) total savings from community pricing.',
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
  'How does pricing work?',
  'What is Community Priority?',
  'How do I sell energy?',
  'How do I buy energy?',
];

export default faq;
