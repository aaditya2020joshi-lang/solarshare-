export default function Sun({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="30"
          x2="50"
          y2="17"
          stroke="#fbbf24"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${(i * 360) / 8} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="18" fill="url(#sunGradient)" />
    </svg>
  );
}
