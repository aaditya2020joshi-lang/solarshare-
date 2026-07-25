import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const panelTypes = [
  {
    name: 'Monocrystalline',
    icon: '⬛',
    tag: 'Most powerful',
    description:
      "Makes the most power for the smallest space. Costs a bit more, but great if your roof isn't very big.",
    details: [
      'Lasts about 25–30 years.',
      'Sleek, uniform black look.',
      'Higher upfront cost per panel, but you need fewer of them.',
      'Holds up well over time — loses less power as it ages.',
    ],
  },
  {
    name: 'Polycrystalline',
    icon: '🔷',
    tag: 'Best value',
    description:
      'Cheaper than the option above. Needs a little more space for the same power — good if your roof is big.',
    details: [
      'Also lasts about 25–30 years.',
      'Slightly bluish, speckled look.',
      'Lower upfront cost — a solid pick if space isn\'t tight.',
      'Reliable, well-tested technology.',
    ],
  },
  {
    name: 'Thin-Film',
    icon: '🎞️',
    tag: 'Flexible',
    description:
      "Light and bendable, so it fits curved or uneven roofs. Needs more space for the same power, but it's very versatile.",
    details: [
      'Usually lasts 10–20 years — shorter than the other two.',
      'Cheapest per panel, but you need more of them.',
      'Handles shade and heat a bit better.',
      'Good for unusual roofs or lightweight structures that can\'t hold heavy panels.',
    ],
  },
];

const spaces = [
  {
    name: 'Rooftop',
    icon: '🏠',
    description: 'The standard choice — panels on your house roof, if it gets good sunlight.',
    details: [
      'Works best with a roof that isn\'t heavily shaded most of the day.',
      'Most installers will check your roof for free before you commit.',
      'No extra land needed — uses space you already have.',
    ],
  },
  {
    name: 'Ground-mounted',
    icon: '🌾',
    description: "On open land or in your yard — good if you'd rather not use your roof.",
    details: [
      'Needs open, unshaded land you\'re okay dedicating to panels.',
      'Easier to angle for maximum sun than a fixed roof.',
      'Easier to clean and maintain since it\'s at ground level.',
    ],
  },
  {
    name: 'Balcony panels',
    icon: '🏢',
    description: 'Small panels for a balcony railing — great for apartments without roof access.',
    details: [
      'Needs a railing or wall that gets decent sun.',
      'If you\'re renting, check with your landlord or society first.',
      'Produces less power than a full rooftop system, but a good starting point.',
    ],
  },
  {
    name: 'Parking shade',
    icon: '🚗',
    description: 'Panels over your parking spot — shades your car and makes power at once.',
    details: [
      'Needs an open parking spot and a simple frame built over it.',
      'Doubles as protection from sun and rain for your vehicle.',
      'A good option if your roof isn\'t available or suitable.',
    ],
  },
  {
    name: 'Farm panels',
    icon: '🌱',
    description: 'Raised above farmland — crops keep growing underneath while it makes power.',
    details: [
      'Panels are raised on a frame so sunlight still reaches crops below.',
      'Lets you earn from both farming and energy on the same land.',
      'Still a newer approach — worth discussing with a local installer.',
    ],
  },
];

const buyerSteps = [
  'Sign up as a Buyer. If money is tight where you live, turn on "Community Priority" — it can get you a lower price.',
  'Browse listings near you and pick one you like.',
  'Click "Request Energy" and say how much you need.',
  'Message the seller to sort out the details.',
  'Once they say yes, it shows up in your Dashboard.',
];

const sellerSteps = [
  'Sign up as a Seller with your location.',
  'Create a listing: how much energy you have, and your price.',
  'Check "Requests" for buyers who want to buy from you.',
  'Accept or decline each one.',
  'Message buyers to arrange things, and track your earnings in your Dashboard.',
];

const requestFlowSteps = [
  {
    icon: '📨',
    title: 'You send a request',
    description:
      "Pick a listing, enter how many kWh you want, and hit \"Request Energy.\" This locks in the price you'll pay right then — the seller's standard rate, or their community rate if you have Community Priority on and they offer one. Nothing is charged yet.",
  },
  {
    icon: '⭐',
    title: 'Priority requests jump the queue',
    description:
      "If you're a Community Priority buyer, your request is flagged and shown to the seller before non-priority requests, even ones sent earlier. Everyone still gets seen — priority just means you're seen first.",
  },
  {
    icon: '👀',
    title: 'The seller reviews it',
    description:
      'Your request lands in the seller\'s queue as "pending." They see how much you want, at what price, and whether you\'re a priority buyer. It stays pending until they act.',
  },
  {
    icon: '✅',
    title: 'They accept — or decline',
    description:
      "If accepted, that amount of kWh is immediately reserved: it's subtracted from the listing's available energy (and the listing closes automatically if that was the last of it). Your request status flips to \"accepted.\" If declined, nothing is charged or reserved — you're free to request from someone else.",
  },
  {
    icon: '💬',
    title: 'You message each other to arrange things',
    description:
      "Whether it's pending, accepted, or declined, you can message the seller directly from \"My Requests\" to ask questions or work out the practical details — SolarShare doesn't automate delivery, so this is where you coordinate it.",
  },
  {
    icon: '📊',
    title: 'It shows up in your Dashboard',
    description:
      'Accepted requests count toward your spending stats and energy history in your Dashboard, so you can track what you\'ve bought over time.',
  },
];

function RequestFlow() {
  return (
    <ol className="relative border-l-2 border-brand-100 dark:border-brand-900 ml-3 space-y-8">
      {requestFlowSteps.map((step, i) => (
        <li key={step.title} className="relative pl-8">
          <span className="absolute -left-[27px] top-0 w-10 h-10 rounded-full bg-white dark:bg-gray-900 border-2 border-brand-200 dark:border-brand-800 flex items-center justify-center text-lg">
            {step.icon}
          </span>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {i + 1}. {step.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}

function StepList({ title, steps, accent }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6">
      <h3 className={`font-semibold mb-4 ${accent}`}>{title}</h3>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ExpandableCard({ item, open, onToggle, ctaTo, ctaLabel }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        open
          ? 'border-brand-300 dark:border-brand-700 ring-1 ring-brand-100 dark:ring-brand-900'
          : 'border-gray-100 dark:border-gray-800 hover:-translate-y-1'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-5"
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
            {item.tag && (
              <span className="inline-block text-xs text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-full mb-2">
                {item.tag}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
      </button>

      {open && (
        <div className="px-5 pb-5 animate-fade-in-up">
          <ul className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3 mb-4">
            {item.details.map((d, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                <span className="text-brand-500 dark:text-brand-400 flex-shrink-0">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
          {ctaTo && (
            <Link
              to={ctaTo}
              className="block text-center w-full bg-gradient-to-r from-brand-600 to-sky-accent hover:shadow-md text-white text-sm font-medium py-2 rounded-full transition-all"
            >
              {ctaLabel || 'Browse panels →'}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function Learn() {
  const [openPanel, setOpenPanel] = useState(null);
  const [openSpace, setOpenSpace] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    el?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Learn</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          How SolarShare works, in plain terms — plus simple tips on solar panels if you're new to
          this.
        </p>
      </div>

      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">How SolarShare works</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <StepList title="For Buyers" steps={buyerSteps} accent="text-brand-700 dark:text-brand-400" />
          <StepList title="For Sellers" steps={sellerSteps} accent="text-sky-700 dark:text-sky-400" />
        </div>
      </section>

      <section id="request-flow" className="mb-14 scroll-mt-20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          What happens after you request energy?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
          Requesting energy isn't an instant purchase — it starts a conversation with the seller.
          Here's exactly what happens, step by step.
        </p>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <RequestFlow />
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Which solar panel is right for you?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
          Thinking about installing solar so you can start selling? Here's the simple version —
          tap a card for more. (For the real decision, talk to a local installer.)
        </p>
        <div className="grid sm:grid-cols-3 gap-5 items-start">
          {panelTypes.map((p) => (
            <ExpandableCard
              key={p.name}
              item={p}
              open={openPanel === p.name}
              onToggle={() => setOpenPanel(openPanel === p.name ? null : p.name)}
              ctaTo={`/panels?panelType=${encodeURIComponent(p.name)}`}
              ctaLabel={`Shop ${p.name} panels →`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Where would your panels go?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
          Pick whichever matches your home — tap a card for more.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {spaces.map((s) => (
            <ExpandableCard
              key={s.name}
              item={s}
              open={openSpace === s.name}
              onToggle={() => setOpenSpace(openSpace === s.name ? null : s.name)}
              ctaTo="/panels"
              ctaLabel="Browse vendors & panels →"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
