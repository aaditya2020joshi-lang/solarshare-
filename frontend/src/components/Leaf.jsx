export default function Leaf({ className = '' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 2C10 6 4 16 4 24c0 8 7 14 16 14s16-6 16-14C36 16 30 6 20 2z"
        fill="currentColor"
      />
      <path
        d="M20 6C20 6 20 20 20 36"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
