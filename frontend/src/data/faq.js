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
    title: 'Instead of "Good Morning"',
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
    title: 'Instead of "I Love You"',
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
    title: 'Replies to "How Are You?"',
    items: [
      'Pretty good — spent the afternoon [doing something], how about you?',
      'Honestly better now that you texted.',
      'Good so far, ask me again after coffee.',
      "Can't complain. What's going on with you?",
      "Better now that I'm hearing from you.",
      "Doing well — but I'd rather catch up over coffee than over text.",
      'Good, and getting better the longer we talk.',
    ],
  },
  {
    keywords: ['conversation starters', 'conversation starter', 'flirty question', 'build chemistry', 'good questions to ask'],
    type: 'list',
    title: 'Conversation Starters',
    items: [
      "What's something you're weirdly good at?",
      "What's a small thing that instantly makes your day better?",
      "What's the best thing that's happened to you this week?",
      "What's something you've always wanted to try but haven't yet?",
      "What's one thing people always get wrong about you?",
      "What's a quality that instantly makes someone more interesting to you?",
      "What's the best compliment you've ever gotten?",
    ],
  },
  {
    keywords: ['deep question', 'meaningful question', 'get to know someone', 'ask her these', 'ask him these'],
    type: 'list',
    title: 'Deep Questions to Build Connection',
    items: [
      "What's a moment that changed how you see things?",
      "What's something you wish people understood about you?",
      'What do you actually want more of right now?',
      "What's a lesson you learned the hard way?",
      'What kind of person brings out the best version of you?',
      "What's a version of yourself you're still trying to become?",
      'What kind of relationship actually feels healthy to you?',
      "What's something you want out of life that most people don't understand?",
    ],
  },
  {
    keywords: ['text with confidence', 'texting confidence', 'texting tips', 'how to text'],
    type: 'list',
    title: 'Texting With Confidence',
    items: [
      "Be direct instead of vague — 'Want to grab coffee Saturday?' instead of 'We should hang out sometime.'",
      'Skip the over-explaining or apologizing for texting first.',
      "Take your time replying — you don't owe anyone an instant response.",
      'Say what you mean instead of hinting at it.',
      'If something feels off, say so directly instead of going quiet.',
      "Reply with a plan, not just an acknowledgment — 'Free Thursday, want to grab food?' instead of just 'ok.'",
    ],
  },
  {
    keywords: ['texts people like', 'good texts to send', 'what to text'],
    type: 'list',
    title: 'Texts People Actually Respond To',
    items: [
      'Reference something they specifically said earlier.',
      'Ask a genuine follow-up question instead of a generic one.',
      'Share something small and real about your day.',
      "Skip \"hey\" and \"what's up\" as openers.",
      'Keep the tone playful instead of overly formal.',
      'Match their energy — a short reply back-and-forth, or more detail if they write more.',
      'Ask their opinion on something instead of only stating facts about your day.',
    ],
  },
  {
    keywords: ['texting habits', 'stay on someones mind', 'build connection', 'keep someone interested'],
    type: 'list',
    title: 'Texting Habits That Build Connection',
    items: [
      'Show genuine interest by asking real follow-up questions, not just replying.',
      'Match their energy — mirror a short, casual reply with your own, and a longer one with more detail.',
      'Share something personal once in a while instead of only surface-level updates.',
      "Compliment something specific about them, not just a generic \"you're great.\"",
      "Leave a little mystery — you don't have to answer everything right away.",
      'Use humor to keep things light instead of over-explaining.',
      'Give them space when they need it instead of double-texting.',
      "Be a little unpredictable — you don't have to reply in the same rhythm every time.",
    ],
  },
  {
    keywords: ['healthy boundaries', 'self respect', 'not chasing', 'value myself', 'boundaries in dating'],
    type: 'list',
    title: 'Setting Healthy Boundaries',
    items: [
      "I'm looking for a partner, not someone I have to convince to choose me.",
      "I want someone who's sure about wanting to be here — not someone I have to chase.",
      'Consistency matters more to me than grand gestures.',
      "I'd rather be honest about what I need than pretend I'm fine with less.",
      "I don't force connections that only work when I'm the one putting in effort.",
      "If someone wants to walk away, I'll let them — I'm not here to convince anyone to stay.",
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

export const topics = faq.filter((entry) => entry.type === 'list');

export default faq;
