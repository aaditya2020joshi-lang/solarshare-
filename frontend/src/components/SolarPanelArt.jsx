const CELL_STYLES = {
  Monocrystalline: { cell: '#0f172a', grid: '#475569', frame: '#1e293b' },
  Polycrystalline: { cell: '#1d4ed8', grid: '#93c5fd', frame: '#1e293b' },
  'Thin-Film': { cell: '#334155', grid: '#64748b', frame: '#111827' },
};

function Cells({ type }) {
  const style = CELL_STYLES[type] || CELL_STYLES.Monocrystalline;
  const cols = 6;
  const rows = 4;
  const cellW = 46;
  const cellH = 40;
  const gap = 2;
  const startX = 40;
  const startY = 40;
  const cells = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cellW + gap);
      const y = startY + r * (cellH + gap);
      const speckle = type === 'Polycrystalline';
      cells.push(
        <rect key={`${r}-${c}`} x={x} y={y} width={cellW} height={cellH} fill={style.cell} />
      );
      if (speckle) {
        cells.push(
          <circle key={`${r}-${c}-s1`} cx={x + 12} cy={y + 14} r="3" fill={style.grid} opacity="0.5" />,
          <circle key={`${r}-${c}-s2`} cx={x + 32} cy={y + 26} r="4" fill={style.grid} opacity="0.4" />,
          <circle key={`${r}-${c}-s3`} cx={x + 22} cy={y + 8} r="2.5" fill={style.grid} opacity="0.35" />
        );
      }
    }
  }
  return <g>{cells}</g>;
}

export default function SolarPanelArt({ panelType, className = '' }) {
  const style = CELL_STYLES[panelType] || CELL_STYLES.Monocrystalline;
  const bent = panelType === 'Thin-Film';

  return (
    <div
      className={`bg-gradient-to-br from-brand-50 via-sky-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 ${className}`}
    >
      <svg viewBox="0 0 400 220" className="w-full h-full" aria-hidden="true">
        <g transform={bent ? 'skewY(-3)' : undefined}>
          <rect
            x="30"
            y="30"
            width="340"
            height="180"
            rx="6"
            fill={style.frame}
          />
          <rect
            x="36"
            y="36"
            width="328"
            height="168"
            rx="3"
            fill="#0b1220"
          />
          <Cells type={panelType} />
          <line x1="40" y1="122" x2="364" y2="122" stroke={style.grid} strokeWidth="2" opacity="0.6" />
          <line x1="40" y1="82" x2="364" y2="82" stroke={style.grid} strokeWidth="1" opacity="0.4" />
          <line x1="40" y1="162" x2="364" y2="162" stroke={style.grid} strokeWidth="1" opacity="0.4" />
        </g>
        {/* glare */}
        <polygon points="60,30 110,30 40,210 10,210" fill="white" opacity="0.08" />
        <polygon points="260,30 290,30 220,210 200,210" fill="white" opacity="0.06" />
        {/* mounting legs */}
        <line x1="140" y1="210" x2="120" y2="220" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
        <line x1="260" y1="210" x2="280" y2="220" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
