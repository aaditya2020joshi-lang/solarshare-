import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🔆',
    title: 'Sell surplus solar',
    description:
      'List your excess kWh with a standard price, plus an optional discounted community rate for households that need it most.',
  },
  {
    icon: '🤝',
    title: 'Buy from neighbors',
    description:
      'Browse nearby listings, send a request, and power your home with clean energy at a fair price.',
  },
  {
    icon: '⚖️',
    title: 'Priority for those who need it',
    description:
      "Buyers from low-income or underserved areas can self-identify at sign-up so their requests are surfaced first and matched to community pricing.",
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

        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center animate-fade-in-up">
          <p className="inline-block bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-semibold px-3 py-1 rounded-full mb-5">
            Supporting UN Sustainable Development Goal 7
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Clean energy that's{' '}
            <span className="bg-gradient-to-r from-brand-600 to-sky-accent bg-clip-text text-transparent">
              actually affordable
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            SolarShare connects homes and businesses with surplus solar power to nearby
            neighbors who don't have solar access — prioritizing energy affordability and
            access for underserved communities, not just trading efficiency.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
            <Link
              to="/listings"
              className="bg-white dark:bg-gray-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-gray-700 font-semibold px-7 py-3.5 rounded-full hover:bg-brand-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 transition-all"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20 grid sm:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 dark:from-brand-900/50 dark:to-sky-900/50 flex items-center justify-center text-3xl">
              {f.icon}
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{f.description}</p>
          </div>
        ))}
      </section>

      <section className="relative bg-gradient-to-r from-brand-700 to-sky-700 dark:from-gray-900 dark:to-gray-900 dark:border-y dark:border-gray-800 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why this matters</h2>
          <p className="text-brand-50 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            SDG 7 calls for affordable, reliable, sustainable, and modern energy for all.
            Most energy marketplaces optimize purely for trading efficiency. SolarShare
            optimizes for access — making sure the households that need affordable clean
            energy the most aren't left behind.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Ready to join the grid?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Whether you have surplus solar to share or need affordable clean energy, it starts here.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Create your account
        </Link>
      </section>
    </div>
  );
}
