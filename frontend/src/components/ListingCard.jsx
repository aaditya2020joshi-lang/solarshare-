import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { BoltIcon, LocationIcon } from './icons';

export default function ListingCard({ listing }) {
  const { user } = useAuth();

  const isPriorityBuyer = user?.role === 'buyer' && user.communityPriority;
  const hasCommunityPrice = listing.community_price !== null;
  const effectivePrice =
    isPriorityBuyer && hasCommunityPrice ? listing.community_price : listing.standard_price;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
          <LocationIcon className="w-4 h-4 text-gray-400" />
          {listing.location}
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Avatar name={listing.seller_name} size="w-6 h-6" />
        <span className="text-xs text-gray-500">{listing.seller_name}</span>
      </div>

      <p className="text-sm text-gray-600 mb-4 flex items-center gap-1.5">
        <BoltIcon className="w-4 h-4 text-amber-500" />
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

      <span className="block text-center w-full bg-brand-600 group-hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition-colors">
        View Details
      </span>
    </Link>
  );
}
