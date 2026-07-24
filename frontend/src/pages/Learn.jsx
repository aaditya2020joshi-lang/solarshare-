import { useState } from 'react';

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

function ExpandableCard({ item, open, onToggle }) {
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
          <ul className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
            {item.details.map((d, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                <span className="text-brand-500 dark:text-brand-400 flex-shrink-0">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Learn() {
  const [openPanel, setOpenPanel] = useState(null);
  const [openSpace, setOpenSpace] = useState(null);

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
            />
          ))}
        </div>
      </section>
    </div>
  );
}
