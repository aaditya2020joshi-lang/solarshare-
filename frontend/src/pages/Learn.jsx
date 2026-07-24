const panelTypes = [
  {
    name: 'Monocrystalline',
    icon: '⬛',
    tag: 'Most powerful',
    description:
      "Makes the most power for the smallest space. Costs a bit more, but great if your roof isn't very big.",
  },
  {
    name: 'Polycrystalline',
    icon: '🔷',
    tag: 'Best value',
    description:
      'Cheaper than the option above. Needs a little more space for the same power — good if your roof is big.',
  },
  {
    name: 'Thin-Film',
    icon: '🎞️',
    tag: 'Flexible',
    description:
      "Light and bendable, so it fits curved or uneven roofs. Needs more space for the same power, but it's very versatile.",
  },
];

const spaces = [
  {
    name: 'Rooftop',
    icon: '🏠',
    description: 'The standard choice — panels on your house roof, if it gets good sunlight.',
  },
  {
    name: 'Ground-mounted',
    icon: '🌾',
    description: "On open land or in your yard — good if you'd rather not use your roof.",
  },
  {
    name: 'Balcony panels',
    icon: '🏢',
    description: "Small panels for a balcony railing — great for apartments without roof access.",
  },
  {
    name: 'Parking shade',
    icon: '🚗',
    description: 'Panels over your parking spot — shades your car and makes power at once.',
  },
  {
    name: 'Farm panels',
    icon: '🌱',
    description: 'Raised above farmland — crops keep growing underneath while it makes power.',
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

export default function Learn() {
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
          Thinking about installing solar so you can start selling? Here's the simple version.
          (For the real decision, talk to a local installer.)
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {panelTypes.map((p) => (
            <div
              key={p.name}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5"
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{p.name}</h3>
              <span className="inline-block text-xs text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-full mb-2">
                {p.tag}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Where would your panels go?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
          Pick whichever matches your home.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((s) => (
            <div
              key={s.name}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5"
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{s.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
