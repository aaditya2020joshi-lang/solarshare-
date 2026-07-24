import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const BAR_MAX_WIDTH = 24;
const CHART_HEIGHT = 160;
const LEFT_MARGIN = 44;
const BOTTOM_MARGIN = 24;

function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

function roundedTopBarPath(x, y, w, h, r) {
  if (h <= 0) return '';
  const radius = Math.min(r, w / 2, h);
  return `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`;
}

export default function BarChart({ data, formatValue = (v) => v }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb';
  const axisTextColor = '#9ca3af';
  const baselineColor = isDark ? 'rgba(255,255,255,0.25)' : '#c3c2b7';

  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = [0, max / 2, max];

  const plotWidth = Math.max(data.length * 56, 200);
  const width = plotWidth + LEFT_MARGIN;
  const bandWidth = plotWidth / data.length;
  const barWidth = Math.min(BAR_MAX_WIDTH, bandWidth - 8);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT + BOTTOM_MARGIN}`}
        width={width}
        height={CHART_HEIGHT + BOTTOM_MARGIN}
        style={{ display: 'block' }}
      >
        {ticks.map((t, i) => {
          const y = CHART_HEIGHT - (t / max) * CHART_HEIGHT;
          return (
            <g key={i}>
              <line
                x1={LEFT_MARGIN}
                x2={width}
                y1={y}
                y2={y}
                stroke={gridColor}
                strokeWidth="1"
              />
              <text x={LEFT_MARGIN - 6} y={y + 3} fontSize="10" fill={axisTextColor} textAnchor="end">
                {formatValue(t)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const barHeight = (d.value / max) * CHART_HEIGHT;
          const x = LEFT_MARGIN + i * bandWidth + (bandWidth - barWidth) / 2;
          const y = CHART_HEIGHT - barHeight;
          const isHovered = hoverIndex === i;

          return (
            <g
              key={i}
              onPointerEnter={() => setHoverIndex(i)}
              onPointerLeave={() => setHoverIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={LEFT_MARGIN + i * bandWidth} y={0} width={bandWidth} height={CHART_HEIGHT} fill="transparent" />
              <path d={roundedTopBarPath(x, y, barWidth, Math.max(barHeight, 2), 4)} fill="#16a34a" opacity={isHovered ? 1 : 0.85} />
              <text
                x={x + barWidth / 2}
                y={CHART_HEIGHT + 16}
                fontSize="10"
                fill={axisTextColor}
                textAnchor="middle"
              >
                {d.label}
              </text>

              {isHovered && (
                <g>
                  {(() => {
                    const tooltipW = 84;
                    const tooltipX = Math.min(Math.max(x + barWidth / 2 - tooltipW / 2, LEFT_MARGIN), width - tooltipW);
                    const tooltipY = Math.max(y - 28, 0);
                    return (
                      <>
                        <rect x={tooltipX} y={tooltipY} width={tooltipW} height={22} rx={4} fill="#111827" />
                        <text x={tooltipX + tooltipW / 2} y={tooltipY + 15} fontSize="11" fill="#ffffff" textAnchor="middle">
                          {formatValue(d.value)}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
            </g>
          );
        })}

        <line x1={LEFT_MARGIN} x2={width} y1={CHART_HEIGHT} y2={CHART_HEIGHT} stroke={baselineColor} strokeWidth="1" />
      </svg>
    </div>
  );
}
