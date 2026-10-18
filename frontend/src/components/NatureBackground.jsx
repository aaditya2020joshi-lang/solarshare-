const LEAF = 'M0 0 C 10 -14 28 -14 36 0 C 28 14 10 14 0 0 Z M0 0 L36 0';

const leaves = [
  [6, 12, 40, 1.1], [18, 28, -25, 0.8], [30, 8, 70, 0.9], [44, 22, 15, 1.2],
  [58, 10, -50, 0.8], [72, 30, 35, 1], [86, 14, -20, 1.1], [94, 34, 60, 0.8],
  [10, 50, -35, 1], [26, 62, 20, 0.9], [40, 48, -60, 1.1], [64, 56, 45, 0.8],
  [80, 66, -15, 1], [92, 52, 30, 1.2], [14, 80, 55, 0.9], [50, 74, -30, 1],
];

function Tree({ x, h, w }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-w * 0.06} y={-h * 0.28} width={w * 0.12} height={h * 0.28} rx="3" className="nb-trunk" />
      <ellipse cx="0" cy={-h * 0.5} rx={w * 0.5} ry={h * 0.26} className="nb-crown" />
      <ellipse cx={-w * 0.22} cy={-h * 0.38} rx={w * 0.34} ry={h * 0.2} className="nb-crown" />
      <ellipse cx={w * 0.22} cy={-h * 0.4} rx={w * 0.32} ry={h * 0.19} className="nb-crown" />
      <ellipse cx="0" cy={-h * 0.72} rx={w * 0.34} ry={h * 0.2} className="nb-crown" />
    </g>
  );
}

export default function NatureBackground() {
  return (
    <div aria-hidden="true" className="nature-bg">
      <svg className="nb-leaves" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {leaves.map(([x, y, r, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s * 0.12})`}>
            <path d={LEAF} className="nb-leaf" />
          </g>
        ))}
      </svg>
      <svg className="nb-trees" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
        <g transform="translate(0 300)">
          {[
            [60, 190, 110], [190, 250, 140], [330, 170, 100], [470, 230, 130],
            [620, 180, 105], [770, 255, 145], [910, 175, 100], [1040, 235, 135], [1150, 190, 110],
          ].map(([x, h, w], i) => (
            <Tree key={i} x={x} h={h} w={w} />
          ))}
        </g>
      </svg>
    </div>
  );
}
