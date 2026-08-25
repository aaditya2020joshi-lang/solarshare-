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
  {
    keywords: ['good morning', 'instead of good morning', 'morning text'],
    answer:
      'A plain "good morning" is fine, but it lands warmer with one specific, personal touch — try "Hope your coffee\'s stronger than your Monday," "You crossed my mind before my alarm did," or "Hope today treats you well." The goal is a line that couldn\'t be copy-pasted to just anyone.',
  },
  {
    keywords: ['i love you', 'instead of i love you', 'say i love you'],
    answer:
      '"I love you" is never wrong, but a more specific version tends to land harder — "You\'re the best part of my day, every day," "I don\'t know how I did any of this without you," or "I\'m grateful for you every time I think about it." Honest and specific beats a line that could apply to anyone.',
  },
  {
    keywords: ['how are you', 'reply to how are you', 'respond to how are you'],
    answer:
      'Instead of a flat "good, you?", give them something real to respond to — "Pretty good, spent the afternoon [doing something], how about you?" or "Honestly better now that you texted." One small detail turns a dead-end question into an actual conversation.',
  },
  {
    keywords: ['conversation starter', 'flirty question', 'build chemistry', 'good questions to ask'],
    answer:
      'Skip the small talk and ask something that gets a real answer — "What\'s something you\'re weirdly good at?", "What\'s a small thing that instantly makes your day better?", or "What\'s the best thing that\'s happened to you this week?" Specific, slightly personal questions get better replies than generic ones.',
  },
  {
    keywords: ['deep question', 'meaningful question', 'get to know someone', 'ask her these', 'ask him these'],
    answer:
      'For a conversation to go somewhere real, ask questions that invite a story instead of a fact — "What\'s a moment that changed how you see things?", "What\'s something you wish people understood about you?", or "What do you actually want more of right now?" Then follow up on what they actually say.',
  },
  {
    keywords: ['text with confidence', 'texting confidence', 'texting tips', 'how to text'],
    answer:
      'Confident texting comes down to a few habits: be direct instead of vague ("Want to grab coffee Saturday?" beats "We should hang out sometime"), skip the over-explaining or apologizing for texting, and don\'t feel like you owe anyone an instant reply. Clear and calm reads better than eager.',
  },
  {
    keywords: ['texts people like', 'good texts to send', 'what to text'],
    answer:
      'People generally respond well to texts that feel specific to them — referencing something they said, asking a genuine follow-up, or sharing something small and real about your day — rather than generic openers like "hey" or "what\'s up." A little specificity goes further than a clever line.',
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
  'Instead of good morning, what should I say?',
  'What are good conversation starters?',
  'How do I reply to "how are you"?',
  'How do I sign up?',
];

export default faq;
