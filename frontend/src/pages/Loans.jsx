import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PRODUCTS = [
  {
    id: 'micro',
    icon: '🌱',
    title: 'Micro Loan',
    tagline: 'Small amounts, lower interest, fast approval.',
    rate: 8,
    maxAmount: 25000,
  },
];

function storageKey(userId) {
  return `sahara_loans_${userId}`;
}

function formatINR(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function Loans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [openProduct, setOpenProduct] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(user.id));
    setLoans(stored ? JSON.parse(stored) : []);
  }, [user.id]);

  function persist(nextLoans) {
    setLoans(nextLoans);
    localStorage.setItem(storageKey(user.id), JSON.stringify(nextLoans));
  }

  function openApply(product) {
    setOpenProduct(product.id === openProduct ? null : product.id);
    setAmount('');
    setError('');
  }

  function submitApplication(product) {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    if (value > product.maxAmount) {
      setError(`Max amount for this loan is ${formatINR(product.maxAmount)}.`);
      return;
    }

    const tenureMonths = 12;
    const emi = (value * (1 + product.rate / 100)) / tenureMonths;

    const application = {
      id: `${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      icon: product.icon,
      amount: value,
      rate: product.rate,
      tenureMonths,
      emi,
      appliedAt: new Date().toISOString(),
      status: 'Approved',
    };

    persist([application, ...loans]);
    setOpenProduct(null);
    setAmount('');
    setError('');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loans</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Apply for one of our loan products below — approval is instant.
      </p>

      <div className="grid gap-6 mb-10 max-w-sm">
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 flex flex-col"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 dark:from-brand-900/50 dark:to-sky-900/50 flex items-center justify-center text-2xl mb-4">
              {product.icon}
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white mb-1">{product.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">{product.tagline}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              {product.rate}% interest · up to {formatINR(product.maxAmount)}
            </p>

            {openProduct === product.id ? (
              <div className="space-y-2">
                <input
                  type="number"
                  min="1"
                  autoFocus
                  placeholder={`Amount (max ${formatINR(product.maxAmount)})`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => submitApplication(product)}
                    className="flex-1 bg-gradient-to-r from-brand-600 to-sky-accent text-white text-sm font-semibold py-2 rounded-full hover:shadow-md transition-all"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setOpenProduct(null)}
                    className="px-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openApply(product)}
                className="bg-gradient-to-r from-brand-600 to-sky-accent text-white text-sm font-semibold py-2 rounded-full hover:shadow-md transition-all"
              >
                Apply
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Loans</h2>
      {loans.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">You haven't applied for a loan yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Est. EMI</th>
                <th className="px-4 py-3 font-medium">Applied</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    {loan.icon} {loan.productTitle}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatINR(loan.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{loan.rate}%</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatINR(loan.emi)}/mo</td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                    {new Date(loan.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-4">
        Demo application — this is a prototype interface, no funds are actually disbursed.
      </p>
    </div>
  );
}
