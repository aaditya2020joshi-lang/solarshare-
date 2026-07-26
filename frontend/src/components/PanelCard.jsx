import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import SolarPanelArt from './SolarPanelArt';
import { BoltIcon, LocationIcon } from './icons';

export default function PanelCard({ panel }) {
  return (
    <Link
      to={`/panels/${panel.id}`}
      className="group block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
    >
      <SolarPanelArt panelType={panel.panel_type} className="h-36" />

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{panel.name}</h3>
          <span className="text-xs bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
            {panel.panel_type}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
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

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-1.5">
          <BoltIcon className="w-4 h-4 text-amber-500" />
          {panel.wattage}W
        </p>

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
