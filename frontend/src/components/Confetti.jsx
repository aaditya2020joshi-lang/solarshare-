import { useMemo } from 'react';

const COLORS = ['#6366f1', '#38bdf8', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// A burst of falling confetti drawn with CSS only. It is skipped when the user prefers reduced motion.
export default function Confetti({ pieces = 70 }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.4 + Math.random() * 2.2,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
        drift: (Math.random() - 0.5) * 160,
      })),
    [pieces]
  );

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-40">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--drift), 105vh, 0) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
      {items.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            '--drift': `${p.drift}px`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
