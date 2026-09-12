import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, StarIcon, ShieldIcon, TruckIcon } from '../components/icons';

const UNIT_PRICE = 799;

const features = [
  {
    icon: '✊',
    title: 'Grips Like Never Before',
    description: 'Advanced non-slip textured fingertips for secure handling, even when wet or oily.',
  },
  {
    icon: '💧',
    title: '100% Waterproof Shield',
    description: 'Seamless full rubber body, submersible protection against water and liquids.',
  },
  {
    icon: '🛡️',
    title: 'Wrist Armor Cuff',
    description: 'Extended protective cuff for forearm safety and splash protection.',
  },
  {
    icon: '🔥',
    title: 'Heat-Proof Power',
    description: 'High palm heat resistance up to 250°C for handling hot items.',
  },
  {
    icon: '💪',
    title: 'Bends, Never Breaks',
    description: 'Durable, flexible fit withstands constant bending and stretching without tearing.',
  },
  {
    icon: '♻️',
    title: 'Infinite Reuse',
    description: 'Long-lasting eco-friendly materials, easily cleaned and reusable, reduces waste.',
  },
];

const faqs = [
  {
    q: 'Are these actually waterproof?',
    a: "Yes — the glove has a seamless full rubber body, so it's fully submersible and protects against water and liquids.",
  },
  {
    q: 'How much heat can they handle?',
    a: 'The palm is heat-resistant up to 250°C, so they hold up fine for hot pans, trays, and similar everyday heat.',
  },
  {
    q: 'What size do they come in?',
    a: 'PowerGlove comes in one flexible, stretch-fit size designed to comfortably fit most hand sizes.',
  },
  {
    q: 'How do I clean them?',
    a: "Just rinse with water — the material is designed to be easily cleaned and reused, so one pair lasts a long time.",
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are typically dispatched within 1-2 business days and arrive within 5-7 business days depending on your location.',
  },
];

export default function Landing() {
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-brand-950 text-white">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/30 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute top-10 -right-24 w-96 h-96 bg-sky-accent/20 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center animate-fade-in-up">
          <p className="inline-block bg-white/10 backdrop-blur text-brand-200 text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            🧤 PowerGlove
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
            Grime Never Stood{' '}
            <span className="bg-gradient-to-r from-brand-400 to-sky-accent bg-clip-text text-transparent">
              A Chance.
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto mb-4">
            Grip, waterproof, heat-proof, and built to bend without breaking — the last pair of
            work gloves you'll ever need to buy.
          </p>
          <div className="flex items-center justify-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon key={i} className="w-5 h-5 text-brand-400" />
            ))}
            <span className="text-sm text-gray-400 ml-2">Rated 4.8/5 by early customers</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/checkout"
              className="animate-pulse-scale bg-gradient-to-r from-brand-600 to-sky-accent text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-brand-600/30 hover:shadow-xl transition-all text-lg"
            >
              Get Yours Now — ₹{UNIT_PRICE}
            </Link>
            <a
              href="#features"
              className="bg-white/10 backdrop-blur text-white border border-white/20 font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-all"
            >
              See Features
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-5xl mx-auto px-4 py-20 scroll-mt-16">
        <p className="text-center text-xs font-semibold tracking-wide text-brand-600 dark:text-brand-400 uppercase mb-2">
          Built to Last
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
          Everything a work glove should be
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 dark:from-brand-900/50 dark:to-sky-900/50 flex items-center justify-center text-3xl">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative bg-gradient-to-r from-brand-700 to-sky-700 dark:from-gray-900 dark:to-gray-900 dark:border-y dark:border-gray-800 text-white overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <ShieldIcon className="w-8 h-8 mx-auto mb-3" />
            <p className="font-semibold mb-1">30-Day Guarantee</p>
            <p className="text-sm text-brand-50 dark:text-gray-300">Not happy? Full refund, no questions asked.</p>
          </div>
          <div>
            <TruckIcon className="w-8 h-8 mx-auto mb-3" />
            <p className="font-semibold mb-1">Fast Dispatch</p>
            <p className="text-sm text-brand-50 dark:text-gray-300">Ships within 1-2 business days.</p>
          </div>
          <div>
            <CheckIcon className="w-8 h-8 mx-auto mb-3" />
            <p className="font-semibold mb-1">Built to Last</p>
            <p className="text-sm text-brand-50 dark:text-gray-300">Reusable, durable, and easy to clean.</p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ready for a pair that actually holds up?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">₹{UNIT_PRICE} per pair. Free shipping over 2 pairs.</p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              −
            </button>
            <span className="text-xl font-bold text-gray-900 dark:text-white w-10 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>

          <Link
            to={`/checkout?quantity=${quantity}`}
            className="inline-block bg-gradient-to-r from-brand-600 to-sky-accent text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Get Yours Now — ₹{(UNIT_PRICE * quantity).toLocaleString('en-IN')}
          </Link>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-4 py-20 scroll-mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
              >
                <span className="font-medium text-gray-900 dark:text-white">{f.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 animate-fade-in-up">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Grime never stood a chance. Neither should you wait.
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Get your PowerGlove today.</p>
        <Link
          to="/checkout"
          className="inline-block bg-gradient-to-r from-brand-600 to-sky-accent text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Get Yours Now
        </Link>
      </section>
    </div>
  );
}
