import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ListingCard({ listing }) {
  const { user } = useAuth();

  const isPriorityBuyer = user?.role === 'buyer' && user.communityPriority;
  const hasCommunityPrice = listing.community_price !== null;
  const effectivePrice =
    isPriorityBuyer && hasCommunityPrice ? listing.community_price : listing.standard_price;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{listing.location}</h3>
        <span className="text-xs text-gray-500">by {listing.seller_name}</span>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {Number(listing.kwh_available).toFixed(1)} kWh available
      </p>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xl font-bold ${
            isPriorityBuyer && hasCommunityPrice ? 'text-brand-600' : 'text-gray-900'
          }`}
        >
          ₹{Number(effectivePrice).toFixed(2)}/kWh
        </span>
        {isPriorityBuyer && hasCommunityPrice && (
          <span className="line-through text-sm text-gray-400">
            ₹{Number(listing.standard_price).toFixed(2)}
          </span>
        )}
        {hasCommunityPrice && !isPriorityBuyer && (
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
            Community rate available
          </span>
        )}
      </div>

      <span className="block text-center w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition">
        View Details
      </span>
    </Link>
  );
}
