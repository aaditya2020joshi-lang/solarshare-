const panelTypes = [
  {
    name: 'Monocrystalline',
    icon: '⬛',
    efficiency: '~18–22% efficiency',
    description:
      'Cut from a single silicon crystal. Highest efficiency and a sleek black look, so you generate more power from less roof area — but costs more per panel.',
    bestFor: 'Best for: apartments and urban homes with limited or small rooftop space.',
  },
  {
    name: 'Polycrystalline',
    icon: '🔷',
    efficiency: '~15–17% efficiency',
    description:
      'Made from multiple silicon fragments melted together. Slightly less efficient than monocrystalline, but noticeably cheaper per panel.',
    bestFor: 'Best for: larger rooftops, farmhouses, or open plots where space is not the constraint.',
  },
  {
    name: 'Thin-Film',
    icon: '🎞️',
    efficiency: '~10–13% efficiency',
    description:
      'Lightweight and flexible, so it can bend to curved or uneven surfaces. Performs relatively better in high heat and low light, but needs more area for the same output.',
    bestFor: 'Best for: curved or metal-sheet roofs, low load-bearing structures, and portable setups.',
  },
];

const spaces = [
  {
    name: 'Rooftop (residential)',
    icon: '🏠',
    description:
      'The most common setup — panels mounted directly on an existing, largely shade-free roof with enough structural strength.',
  },
  {
    name: 'Ground-mounted',
    icon: '🌾',
    description:
      'For open land, farms, or backyards. Easier to clean and maintain, and panels can be angled for maximum sun exposure.',
  },
  {
    name: 'Balcony / BIPV panels',
    icon: '🏢',
    description:
      "For apartment dwellers without rooftop access — small, plug-in panels mounted on a balcony railing. Doesn't replace a full system, but adds meaningful output.",
  },
  {
    name: 'Carports & parking shades',
    icon: '🚗',
    description:
      'Panels mounted over a driveway or parking area — you get shade for the vehicle and power generation from the same structure.',
  },
  {
    name: 'Agrivoltaics (elevated farm panels)',
    icon: '🌱',
    description:
      'Panels raised above farmland so crops can keep growing underneath. Lets farmers generate power without giving up cultivable land.',
  },
];

const buyerSteps = [
  'Sign up as a Buyer. If you\'re from a low-income or underserved area, turn on "Community Priority" — it can match you to discounted rates.',
  'Browse listings and filter by location, price, or minimum kWh to find sellers near you.',
  'Open a listing you like and click "Request Energy" with the amount you need.',
  'Message the seller directly to coordinate details once your request exists.',
  'Once the seller accepts, track it in your Dashboard — total bought, spending, and savings.',
];

const sellerSteps = [
  'Sign up as a Seller with your location.',
  'Go to "New Listing" and set your available kWh, standard price, and an optional discounted "community price" for priority buyers.',
  'Check "Requests" regularly — Community Priority requests are highlighted and sorted to the top.',
  'Accept or decline each request. Accepting reduces your listed availability automatically.',
  'Message buyers to coordinate handover, and track your earnings in your Dashboard.',
];

function StepList({ title, steps, accent }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className={`font-semibold mb-4 ${accent}`}>{title}</h3>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-700">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Learn</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A quick guide to using SolarShare, plus the basics of choosing solar panels for your
          own space.
        </p>
      </div>

      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5">How SolarShare works</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <StepList title="For Buyers" steps={buyerSteps} accent="text-brand-700" />
          <StepList title="For Sellers" steps={sellerSteps} accent="text-sky-700" />
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Choosing a solar panel type</h2>
        <p className="text-gray-600 text-sm mb-5">
          If you're thinking about installing solar yourself so you can start selling, here's a
          quick primer. This is general guidance — always get a site survey from a certified
          installer before deciding.
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {panelTypes.map((p) => (
            <div key={p.name} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-2xl mb-2">{p.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{p.name}</h3>
              <p className="text-xs text-brand-600 font-medium mb-2">{p.efficiency}</p>
              <p className="text-sm text-gray-600 mb-3">{p.description}</p>
              <p className="text-xs text-gray-500 font-medium">{p.bestFor}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-2">What space do you have?</h2>
        <p className="text-gray-600 text-sm mb-5">
          Different living situations suit different setups — here's what tends to work where.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((s) => (
            <div key={s.name} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.name}</h3>
              <p className="text-sm text-gray-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
