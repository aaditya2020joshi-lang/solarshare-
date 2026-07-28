function PanelRow({ x, y, count = 4, cellW = 26, cellH = 16 }) {
  const cells = [];
  for (let i = 0; i < count; i++) {
    cells.push(
      <rect
        key={i}
        x={x + i * (cellW + 1.5)}
        y={y}
        width={cellW}
        height={cellH}
        fill="#0c4a6e"
        stroke="#38bdf8"
        strokeWidth="0.6"
      />
    );
  }
  return <g>{cells}</g>;
}

export default function RooftopScene({ className = '' }) {
  return (
    <svg viewBox="0 0 800 340" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="roofSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#f0fdf6" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="800" height="340" fill="url(#roofSky)" />

      {/* sun */}
      <circle cx="690" cy="70" r="34" fill="#fbbf24" opacity="0.9" />
      {[0, 45, 90, 135].map((a) => (
        <line
          key={a}
          x1="690"
          y1="20"
          x2="690"
          y2="8"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${a} 690 70)`}
        />
      ))}

      {/* distant hills */}
      <path d="M0,260 C150,220 300,270 500,240 C620,220 720,250 800,235 L800,340 L0,340 Z" fill="#dcfce9" />

      {/* ground */}
      <path d="M0,300 C200,285 600,290 800,280 L800,340 L0,340 Z" fill="#bbf1d0" />

      {/* small tree left */}
      <g transform="translate(90,255)">
        <rect x="-4" y="20" width="8" height="26" fill="#166534" />
        <circle cx="0" cy="0" r="22" fill="#16a34a" />
      </g>

      {/* house body */}
      <rect x="230" y="180" width="300" height="120" fill="#fef9ef" stroke="#d6d3d1" strokeWidth="2" />
      {/* door */}
      <rect x="360" y="230" width="40" height="70" fill="#92400e" rx="3" />
      {/* windows */}
      <rect x="270" y="215" width="45" height="45" fill="#bae6fd" stroke="#ffffff" strokeWidth="4" />
      <rect x="445" y="215" width="45" height="45" fill="#bae6fd" stroke="#ffffff" strokeWidth="4" />

      {/* roof (single slope facing viewer, tilted for panels) */}
      <polygon points="210,180 550,180 500,110 260,110" fill="#44403c" />
      <polygon points="210,180 260,110 260,102 205,175" fill="#292524" />

      {/* solar panels mounted on roof slope */}
      <g transform="skewY(-8) translate(0,10)">
        <PanelRow x={255} y={128} count={4} />
        <PanelRow x={255} y={147} count={4} />
      </g>

      {/* second small tree right of house */}
      <g transform="translate(610,265)">
        <rect x="-4" y="16" width="8" height="20" fill="#166534" />
        <circle cx="0" cy="-4" r="18" fill="#15803d" />
      </g>

      {/* chimney */}
      <rect x="470" y="118" width="18" height="35" fill="#57534e" />
    </svg>
  );
}
