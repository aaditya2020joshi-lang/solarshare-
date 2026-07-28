import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { getPanelImage } from '../lib/panelImages';
import { BoltIcon, LocationIcon } from './icons';

export default function PanelCard({ panel }) {
  return (
    <Link
      to={`/panels/${panel.id}`}
      className="group block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
    >
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-brand-50 via-sky-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
        <img
          src={getPanelImage(panel.wattage)}
          alt="Solar panel"
          loading="lazy"
          className="w-full h-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-2.5 left-2.5 text-xs font-medium bg-white/85 dark:bg-gray-900/80 backdrop-blur text-gray-800 dark:text-gray-100 px-2 py-0.5 rounded-full shadow-sm">
          {panel.panel_type}
        </span>
        <span className="absolute bottom-2.5 right-2.5 text-xs font-medium bg-white/85 dark:bg-gray-900/80 backdrop-blur text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <BoltIcon className="w-3 h-3 text-amber-500" />
          {panel.wattage}W
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{panel.name}</h3>

        <div className="flex items-center gap-2 mb-4">
          <Avatar name={panel.vendor_name} size="w-6 h-6" />
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            {panel.vendor_name}
            {panel.vendor_location && (
              <>
                <LocationIcon className="w-3 h-3 text-gray-400 ml-1" />
                {panel.vendor_location}
              </>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ₹{Number(panel.price).toLocaleString('en-IN')}
          </span>
          <span className="text-sm font-medium text-brand-600 dark:text-brand-400 group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
