import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    location: '',
    communityPriority: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update('role', 'buyer')}
            className={`py-2 rounded-lg border font-medium transition ${
              form.role === 'buyer'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
            }`}
          >
            I'm a Buyer
          </button>
          <button
            type="button"
            onClick={() => update('role', 'seller')}
            className={`py-2 rounded-lg border font-medium transition ${
              form.role === 'seller'
                ? 'bg-sky-accent text-white border-sky-accent'
                : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
            }`}
          >
            I'm a Seller
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location (city, state)
          </label>
          <input
            required
            placeholder="e.g. Pune, Maharashtra"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {form.role === 'buyer' && (
          <label className="flex items-start gap-3 bg-brand-50 border border-brand-200 rounded-lg p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.communityPriority}
              onChange={(e) => update('communityPriority', e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-brand-700">Community Priority: </span>
              I'm from a low-income or underserved area. This surfaces my requests higher
              in sellers' queues and may match me to discounted community pricing.
              No verification required.
            </span>
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
