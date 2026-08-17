import { Link } from 'react-router-dom';
import Leaf from '../components/Leaf';
import Sun from '../components/Sun';

const features = [
  {
    icon: '🤖',
    title: 'AI Financial Service',
    description:
      'Get personalized savings, spending, and budgeting insights powered by AI — so your money works smarter, not just harder.',
    to: '/insights',
  },
  {
    icon: '🛟',
    title: 'Good Payment Failure Support',
    description:
      "If a payment fails or gets stuck, our support team actively tracks it down and resolves it — you're never left guessing where your money went.",
    to: '/support',
  },
  {
    icon: '🔒',
    title: 'Secure, always-on banking',
    description:
      'Bank-grade security on every transaction, with your accounts and cards accessible anytime, anywhere.',
  },
];

const loanFeatures = [
  {
    icon: '🌱',
    title: 'Micro Loans',
    tagline: 'Small loans, lower interest, when you need a hand.',
    points: [
      'Small amounts — get approved for a small loan sized to what you actually need.',
      'Lower interest — micro loans carry a reduced interest rate versus a standard personal loan.',
      'Built to support you — meant for everyday needs, not big-ticket purchases.',
      'Fast approval — apply and get a decision without a lengthy underwriting process.',
    ],
    cta: { label: 'Apply now', to: '/loans' },
  },
  {
    icon: '🎓',
    title: 'AI Support',
    tagline: 'Works for our bank to raise financial literacy.',
    points: [
      'Plain-language answers — ask anything about budgeting, saving, credit, or loans and get a clear explanation.',
      'Personalized lessons — bite-sized tips based on your own spending patterns.',
      'Available anytime — no waiting for a branch or call center.',
      'Judgment-free — ask basic questions without feeling embarrassed.',
    ],
  },
];

export default function Landing() {
  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 bg-brand-200 dark:bg-brand-900/40 rounded-full blur-3xl opacity-50 animate-blob"
          aria-hidden="true"
        />
        <div
          className="absolute top-10 -right-24 w-96 h-96 bg-sky-200 dark:bg-sky-900/30 rounded-full blur-3xl opacity-50 animate-blob-delay"
          aria-hidden="true"
        />

        <Leaf className="hidden sm:block absolute top-24 left-[8%] w-8 h-8 text-brand-400 dark:text-brand-600 animate-leaf-sway" />
        <Leaf
          className="hidden sm:block absolute top-40 right-[10%] w-6 h-6 text-sky-accent/70 animate-leaf-sway"
          style={{ animationDelay: '-2s' }}
        />
        <Leaf className="hidden md:block absolute bottom-32 left-[18%] w-5 h-5 text-brand-500 dark:text-brand-500 animate-leaf-sway" />

        <div
          className="hidden sm:block absolute top-6 right-[16%] w-20 h-20 bg-amber-300 rounded-full blur-2xl opacity-40 dark:opacity-25"
          aria-hidden="true"
        />
        <Sun className="hidden sm:block absolute top-8 right-[17%] w-16 h-16 animate-sun-pulse" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center animate-fade-in-up">
          <p className="inline-block bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-semibold px-3 py-1 rounded-full mb-5">
            Sahara Bank — Smarter banking, backed by AI
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Banking that's{' '}
            <span className="bg-gradient-to-r from-brand-600 to-sky-accent bg-clip-text text-transparent">
              actually on your side
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Sahara Bank combines everyday banking with an AI Financial Service, low-interest micro
            loans, and support that actually resolves payment failures instead of leaving you
            stuck.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Open an Account
            </Link>
            <Link
              to="/login"
              className="bg-white dark:bg-gray-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-gray-700 font-semibold px-7 py-3.5 rounded-full hover:bg-brand-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 transition-all"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20 grid sm:grid-cols-3 gap-8">
        {features.map((f, i) => {
          const CardTag = f.to ? Link : 'div';
          return (
            <CardTag
              key={f.title}
              {...(f.to ? { to: f.to } : {})}
              className="text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up block"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 dark:from-brand-900/50 dark:to-sky-900/50 flex items-center justify-center text-3xl">
                {f.icon}
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{f.description}</p>
            </CardTag>
          );
        })}
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <p className="text-center text-xs font-semibold tracking-wide text-brand-600 dark:text-brand-400 uppercase mb-2">
          Borrowing &amp; financial literacy, reimagined
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
          More ways we're on your side
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {loanFeatures.map((f) => (
            <div
              key={f.title}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 dark:from-brand-900/50 dark:to-sky-900/50 flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-4">
                {f.tagline}
              </p>
              <ul className="space-y-2 flex-1">
                {f.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-brand-500 dark:text-brand-400 flex-shrink-0">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {f.cta && (
                <Link
                  to={f.cta.to}
                  className="mt-4 inline-block text-center bg-gradient-to-r from-brand-600 to-sky-accent text-white text-sm font-semibold py-2 rounded-full hover:shadow-md transition-all"
                >
                  {f.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="relative bg-gradient-to-r from-brand-700 to-sky-700 dark:from-gray-900 dark:to-gray-900 dark:border-y dark:border-gray-800 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Sahara Bank is different</h2>
          <p className="text-brand-50 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Most banks treat you like a transaction. Sahara Bank uses AI to actually understand your
            finances, and when a payment fails, our support team tracks it down and fixes it
            instead of pointing you to a call center queue.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <p className="text-center text-xs font-semibold tracking-wide text-brand-600 dark:text-brand-400 uppercase mb-2">
          Who we're building for
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
          Built for people tired of being ignored by their bank
        </h2>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8 grid sm:grid-cols-[auto_1fr] gap-6 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 dark:from-brand-900/50 dark:to-sky-900/50 flex items-center justify-center text-4xl mx-auto sm:mx-0">
            💳
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Picture someone whose salary transfer fails silently, and their old bank's support
              line just tells them to "wait 3-5 business days" with no real update.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              With Sahara Bank's <span className="font-semibold text-brand-700 dark:text-brand-400">AI Financial Service</span>,
              they get a real-time nudge the moment something looks off. With{' '}
              <span className="font-semibold text-brand-700 dark:text-brand-400">Good Payment Failure Support</span>,
              a real support flow actively chases the failed payment down instead of leaving them
              to guess.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              An illustrative scenario, not an actual customer account.
            </p>
          </div>
        </div>
      </section>

      <section className="relative max-w-4xl mx-auto px-4 py-16 text-center">
        <Leaf className="hidden sm:block absolute top-4 left-[12%] w-6 h-6 text-brand-400 dark:text-brand-600 animate-leaf-sway" />
        <Leaf
          className="hidden sm:block absolute bottom-4 right-[14%] w-5 h-5 text-sky-accent/60 animate-leaf-sway"
          style={{ animationDelay: '-3s' }}
        />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Ready to bank smarter?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Open an account in minutes and get AI-backed insights from day one.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Open your account
        </Link>
      </section>
    </div>
  );
}
