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
      className="group block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
          <LocationIcon className="w-4 h-4 text-gray-400" />
          {listing.location}
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Avatar name={listing.seller_name} size="w-6 h-6" />
        <span className="text-xs text-gray-500 dark:text-gray-400">{listing.seller_name}</span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-1.5">
        <BoltIcon className="w-4 h-4 text-amber-500" />
        {Number(listing.kwh_available).toFixed(1)} kWh available
      </p>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xl font-bold ${
            isPriorityBuyer && hasCommunityPrice
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          ₹{Number(effectivePrice).toFixed(2)}/kWh
        </span>
        {isPriorityBuyer && hasCommunityPrice && (
          <span className="line-through text-sm text-gray-400 dark:text-gray-500">
            ₹{Number(listing.standard_price).toFixed(2)}
          </span>
        )}
        {hasCommunityPrice && !isPriorityBuyer && (
          <span className="text-xs bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
            Community rate available
          </span>
        )}
      </div>

      <span className="block text-center w-full bg-gradient-to-r from-brand-600 to-sky-accent group-hover:shadow-md text-white font-medium py-2 rounded-full transition-all">
        View Details
      </span>
    </Link>
  );
}
