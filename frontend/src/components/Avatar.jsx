const COLORS = ['bg-brand-600', 'bg-sky-600', 'bg-emerald-600', 'bg-teal-600', 'bg-cyan-700'];

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % COLORS.length;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ name, size = 'w-8 h-8' }) {
  return (
    <div
      className={`${size} ${colorFor(name)} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
