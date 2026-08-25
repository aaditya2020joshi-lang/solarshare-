const faq = [
  {
    keywords: ['what is human insights', 'about', 'what is this', 'purpose'],
    type: 'text',
    answer:
      'Human Insights is a place to ask questions and get clear, straightforward answers — no digging through pages of documentation.',
  },
  {
    keywords: ['sign up', 'signup', 'register', 'create account', 'account'],
    type: 'text',
    answer:
      'Click "Sign up" in the top right and fill in your details. Already have an account? Use "Log in" instead.',
  },
  {
    keywords: ['login', 'log in', 'sign in'],
    type: 'text',
    answer: 'Click "Log in" in the navigation bar and enter your email and password.',
  },
  {
    keywords: ['ask', 'question', 'how does this work', 'how do i ask'],
    type: 'text',
    answer:
      'Type your question into the box on the homepage (or here in this chat) and press Ask — a matching answer shows up right away.',
  },
  {
    keywords: ['good morning', 'instead of good morning', 'morning text'],
    type: 'list',
    items: [
      "Hope your coffee's stronger than your Monday.",
      'You crossed my mind before my alarm did.',
      'Hope today treats you well.',
      'Morning — hope your day starts as good as this text finds you.',
    ],
  },
  {
    keywords: ['i love you', 'instead of i love you', 'say i love you'],
    type: 'list',
    items: [
      "You're the best part of my day, every day.",
      "I don't know how I did any of this without you.",
      "I'm grateful for you, every time I think about it.",
      'Every day with you still feels like a good one.',
    ],
  },
  {
    keywords: ['how are you', 'reply to how are you', 'respond to how are you'],
    type: 'list',
    items: [
      'Pretty good — spent the afternoon [doing something], how about you?',
      'Honestly better now that you texted.',
      'Good so far, ask me again after coffee.',
      "Can't complain. What's going on with you?",
    ],
  },
  {
    keywords: ['conversation starters', 'conversation starter', 'flirty question', 'build chemistry', 'good questions to ask'],
    type: 'list',
    items: [
      "What's something you're weirdly good at?",
      "What's a small thing that instantly makes your day better?",
      "What's the best thing that's happened to you this week?",
      "What's something you've always wanted to try but haven't yet?",
    ],
  },
  {
    keywords: ['deep question', 'meaningful question', 'get to know someone', 'ask her these', 'ask him these'],
    type: 'list',
    items: [
      "What's a moment that changed how you see things?",
      "What's something you wish people understood about you?",
      'What do you actually want more of right now?',
      "What's a lesson you learned the hard way?",
    ],
  },
  {
    keywords: ['text with confidence', 'texting confidence', 'texting tips', 'how to text'],
    type: 'list',
    items: [
      "Be direct instead of vague — 'Want to grab coffee Saturday?' instead of 'We should hang out sometime.'",
      'Skip the over-explaining or apologizing for texting first.',
      "Take your time replying — you don't owe anyone an instant response.",
      'Say what you mean instead of hinting at it.',
    ],
  },
  {
    keywords: ['texts people like', 'good texts to send', 'what to text'],
    type: 'list',
    items: [
      'Reference something they specifically said earlier.',
      'Ask a genuine follow-up question instead of a generic one.',
      'Share something small and real about your day.',
      "Skip \"hey\" and \"what's up\" as openers.",
    ],
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

  return best;
}

export const suggestedQuestions = [
  'Instead of good morning, what should I say?',
  'What are good conversation starters?',
  'How do I reply to "how are you"?',
  'How do I sign up?',
];

export default faq;
