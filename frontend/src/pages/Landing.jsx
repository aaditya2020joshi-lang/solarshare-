import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-50 to-sky-50">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="inline-block bg-brand-100 text-brand-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            Supporting UN Sustainable Development Goal 7
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Clean energy that's <span className="text-brand-600">actually affordable</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            SolarShare connects homes and businesses with surplus solar power to nearby
            neighbors who don't have solar access — prioritizing energy affordability and
            access for underserved communities, not just trading efficiency.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
            >
              Get Started
            </Link>
            <Link
              to="/listings"
              className="bg-white text-brand-700 border border-brand-200 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-3xl mb-3">🔆</div>
          <h2 className="font-semibold text-gray-900 mb-2">Sell surplus solar</h2>
          <p className="text-gray-600 text-sm">
            List your excess kWh with a standard price, plus an optional discounted
            community rate for households that need it most.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">🤝</div>
          <h2 className="font-semibold text-gray-900 mb-2">Buy from neighbors</h2>
          <p className="text-gray-600 text-sm">
            Browse nearby listings, send a request, and power your home with clean
            energy at a fair price.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">⚖️</div>
          <h2 className="font-semibold text-gray-900 mb-2">Priority for those who need it</h2>
          <p className="text-gray-600 text-sm">
            Buyers from low-income or underserved areas can self-identify at sign-up so
            their requests are surfaced first and matched to community pricing.
          </p>
        </div>
      </section>

      <section className="bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Why this matters</h2>
          <p className="text-brand-50 max-w-2xl mx-auto">
            SDG 7 calls for affordable, reliable, sustainable, and modern energy for all.
            Most energy marketplaces optimize purely for trading efficiency. SolarShare
            optimizes for access — making sure the households that need affordable clean
            energy the most aren't left behind.
          </p>
        </div>
      </section>
    </div>
  );
}
