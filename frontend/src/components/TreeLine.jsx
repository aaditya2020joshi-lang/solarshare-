function Tree({ x, scale = 1, color, trunkColor = '#166534' }) {
  return (
    <g transform={`translate(${x}, 0) scale(${scale})`}>
      <rect x="-4" y="34" width="8" height="26" rx="2" fill={trunkColor} />
      <circle cx="0" cy="14" r="20" fill={color} />
      <circle cx="-14" cy="26" r="14" fill={color} />
      <circle cx="14" cy="26" r="14" fill={color} />
    </g>
  );
}

function Panel({ x, scale = 1 }) {
  return (
    <g transform={`translate(${x}, 0) scale(${scale})`}>
      <rect x="-16" y="58" width="32" height="4" rx="1" fill="#334155" />
      <line x1="-14" y1="60" x2="-6" y2="34" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="60" x2="6" y2="34" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      <polygon points="-27,35 27,35 18,6 -18,6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
      <line x1="-9" y1="35" x2="-4" y2="6" stroke="#38bdf8" strokeWidth="1" opacity="0.7" />
      <line x1="9" y1="35" x2="4" y2="6" stroke="#38bdf8" strokeWidth="1" opacity="0.7" />
      <line x1="-19" y1="21" x2="19" y2="21" stroke="#38bdf8" strokeWidth="1" opacity="0.7" />
    </g>
  );
}

export default function TreeLine({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1200 140"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0,80 C200,40 400,110 600,70 C800,35 1000,95 1200,60 L1200,140 L0,140 Z"
        className="fill-brand-100 dark:fill-brand-900/30"
      />
      <g opacity="0.55">
        <Tree x={90} scale={0.7} color="#86efac" trunkColor="#15803d" />
        <Tree x={320} scale={0.55} color="#86efac" trunkColor="#15803d" />
        <Tree x={980} scale={0.65} color="#86efac" trunkColor="#15803d" />
        <Tree x={1130} scale={0.5} color="#86efac" trunkColor="#15803d" />
      </g>
      <g>
        <Tree x={190} scale={0.95} color="#16a34a" trunkColor="#166534" />
        <Tree x={460} scale={0.75} color="#16a34a" trunkColor="#166534" />
        <Panel x={570} scale={1} />
        <Tree x={800} scale={0.9} color="#16a34a" trunkColor="#166534" />
        <Panel x={900} scale={0.75} />
        <Tree x={1060} scale={0.7} color="#15803d" trunkColor="#166534" />
      </g>
    </svg>
  );
}
