import React, { useContext } from 'react';
import { C, Txt, FONT, clamp, TimeCtx } from './lib';

type P = { x: number; y: number; s?: number; o?: number; r?: number };
const G: React.FC<P & { children: React.ReactNode }> = ({ x, y, s = 1, o = 1, r = 0, children }) => {
  const t = useContext(TimeCtx);
  const bob = Math.sin(t * 1.6 + x * 0.013 + y * 0.007) * 7;
  const wob = Math.sin(t * 1.1 + x * 0.021) * 1.6;
  return <g transform={`translate(${x} ${y + bob}) rotate(${r + wob}) scale(${s})`} opacity={o}>{children}</g>;
};

export const Phone: React.FC<P & { children?: React.ReactNode; dark?: boolean }> = ({ children, dark, ...p }) => (
  <G {...p}>
    <rect x={-170} y={-330} width={340} height={660} rx={52} fill={C.ink} filter="url(#soft)" />
    <rect x={-154} y={-314} width={308} height={628} rx={40} fill={dark ? C.deep : '#FBFAF7'} />
    <rect x={-50} y={-306} width={100} height={22} rx={11} fill={C.ink} />
    {children}
  </G>
);

export const Clock: React.FC<P & { h: number; m: number; R?: number }> = ({ h, m, R = 200, ...p }) => {
  const ma = (m / 60) * 360;
  const ha = ((h % 12) / 12) * 360 + (m / 60) * 30;
  return (
    <G {...p}>
      <circle r={R + 22} fill={C.ink} filter="url(#soft)" />
      <circle r={R} fill="#FBFAF7" />
      <circle r={R} fill="url(#shade)" opacity={0.5} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-5} y={-R + 14} width={10} height={i % 3 === 0 ? 38 : 20} fill={C.ink}
          transform={`rotate(${i * 30})`} rx={3} />
      ))}
      <rect x={-9} y={-R * 0.52} width={18} height={R * 0.6} rx={9} fill={C.ink} transform={`rotate(${ha})`} />
      <rect x={-6} y={-R * 0.8} width={12} height={R * 0.88} rx={6} fill={C.primary} transform={`rotate(${ma})`} />
      <rect x={-2} y={-R * 0.86} width={4} height={R * 1.0} rx={2} fill={C.red} transform={`rotate(${(useContext(TimeCtx) * 96) % 360})`} />
      <circle r={20} fill={C.primary} />
      <circle r={8} fill="#FBFAF7" />
    </G>
  );
};

export const Calendar: React.FC<P & { day: string; top?: string; hl?: string; w?: number }> = ({ day, top = 'NOV', hl = C.primary, w = 200, ...p }) => (
  <G {...p}>
    <rect x={-w / 2} y={-w * 0.55} width={w} height={w * 1.1} rx={22} fill="url(#paperCard)" filter="url(#soft)" />
    <path d={`M${-w / 2} ${-w * 0.55 + 22} a22 22 0 0 1 22 -22 h${w - 44} a22 22 0 0 1 22 22 v${w * 0.22} h${-w} z`} fill={hl} />
    <Txt x={0} y={-w * 0.42} size={w * 0.13} fill="#fff" weight={800} ls={2}>{top}</Txt>
    <Txt x={0} y={w * 0.16} size={w * 0.46} weight={900}>{day}</Txt>
  </G>
);

export const Envelope: React.FC<P & { label?: string; sub?: string; fill?: string; dashed?: boolean; w?: number; bite?: number; tc?: string }> = ({
  label, sub, fill = C.light, dashed, w = 200, bite = 0, tc = C.ink, ...p
}) => {
  const h = w * 0.66;
  return (
    <G {...p}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={dashed ? 'none' : fill}
        stroke={dashed ? C.ink : 'none'} strokeWidth={4} strokeDasharray={dashed ? '14 12' : undefined} filter={dashed ? undefined : 'url(#soft)'} />
      <path d={`M${-w / 2 + 6} ${-h / 2 + 8} L0 ${h * 0.08} L${w / 2 - 6} ${-h / 2 + 8}`} fill="none" stroke={dashed ? C.ink : C.white} strokeOpacity={dashed ? 0.6 : 0.9} strokeWidth={5} strokeLinejoin="round" />
      {bite > 0 && (
        <circle cx={w / 2 - 6} cy={-h / 2 + 6} r={w * 0.26 * clamp(bite)} fill="var(--bg, #F4F2EC)" />
      )}
      {label && <Txt x={0} y={h / 2 + 36} size={30} weight={800} fill={tc}>{label}</Txt>}
      {sub && <Txt x={0} y={h / 2 + 72} size={24} weight={400} italic fill={tc} opacity={0.75}>{sub}</Txt>}
    </G>
  );
};

export const Coin: React.FC<P> = (p) => {
  const t = useContext(TimeCtx);
  const sx = 0.55 + 0.45 * Math.abs(Math.cos(t * 2.2 + p.x * 0.05));
  return (
  <G {...p}><g transform={`scale(${sx} 1)`}>
    <ellipse cx={0} cy={8} rx={44} ry={44} fill="#B9821B" />
    <circle r={44} fill={C.amber} />
    <circle r={32} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={4} />
    <Txt x={0} y={2} size={26} weight={900} fill="#7A5208">Rp</Txt>
  </g></G>
  );
};

export const Donut: React.FC<P & { pct: number; R?: number; th?: number; col?: string; bg?: string; label?: string; lc?: string }> = ({
  pct, R = 200, th = 70, col = C.primary, bg = C.pale, label, lc = C.ink, ...p
}) => {
  const L = 2 * Math.PI * R;
  return (
    <G {...p}>
      <circle r={R} fill="none" stroke={bg} strokeWidth={th} />
      <circle r={R} fill="none" stroke={col} strokeWidth={th} strokeDasharray={`${L * clamp(pct)} ${L}`} transform="rotate(-90)" />
      {label && <Txt x={0} y={6} size={R * 0.55} weight={900} fill={lc} ls={-3}>{label}</Txt>}
    </G>
  );
};

export const Gauge: React.FC<P & { v: number; R?: number; dark?: boolean }> = ({ v, R = 260, dark, ...p }) => {
  const a = -90 + 180 * clamp(v);
  const seg = (c: string, a0: number, a1: number) => {
    const p0 = [Math.cos((Math.PI * (180 + a0)) / 180) * R, Math.sin((Math.PI * (180 + a0)) / 180) * R];
    const p1 = [Math.cos((Math.PI * (180 + a1)) / 180) * R, Math.sin((Math.PI * (180 + a1)) / 180) * R];
    return <path d={`M${p0[0]} ${p0[1]} A${R} ${R} 0 0 1 ${p1[0]} ${p1[1]}`} stroke={c} strokeWidth={64} fill="none" />;
  };
  return (
    <G {...p}>
      {seg(C.light, 0, 60)}{seg(C.amber, 61, 120)}{seg(C.red, 121, 180)}
      <g transform={`rotate(${a})`}>
        <path d={`M-14 0 L0 ${-R + 40} L14 0 Z`} fill={dark ? '#F4F2EC' : C.ink} />
      </g>
      <circle r={30} fill={dark ? '#F4F2EC' : C.ink} />
    </G>
  );
};

export const Waffle: React.FC<P & { cols: number; rows: number; size?: number; gap?: number; filled: number; col?: string; off?: string }> = ({
  cols, rows, size = 40, gap = 10, filled, col = C.primary, off = C.light, ...p
}) => {
  const n = cols * rows;
  const W = cols * (size + gap) - gap, Hh = rows * (size + gap) - gap;
  return (
    <G {...p}>
      {Array.from({ length: n }).map((_, i) => {
        const cx = (i % cols) * (size + gap) - W / 2, cy = Math.floor(i / cols) * (size + gap) - Hh / 2;
        const f = clamp(filled * n - i) * (0.92 + 0.08 * Math.sin(useContext(TimeCtx) * 3 - i * 0.3));
        return <rect key={i} x={cx} y={cy} width={size} height={size} rx={6} fill={f > 0.5 ? col : off} transform={`translate(${size / 2 + cx} ${size / 2 + cy}) scale(${0.85 + 0.15 * f}) translate(${-size / 2 - cx} ${-size / 2 - cy})`} />;
      })}
    </G>
  );
};

export const QMark: React.FC<P & { col?: string }> = ({ col = '#F4F2EC', ...p }) => (
  <G {...p}>
    <text x={14} y={22} fontFamily={FONT} fontWeight={900} fontSize={560} fill="#000" opacity={0.25} textAnchor="middle" dominantBaseline="middle">?</text>
    <text x={0} y={0} fontFamily={FONT} fontWeight={900} fontSize={560} fill={col} textAnchor="middle" dominantBaseline="middle">?</text>
  </G>
);

export const Bag: React.FC<P & { col?: string }> = ({ col = C.primary, ...p }) => (
  <G {...p}>
    <path d="M-50 -40 C-50 -110 50 -110 50 -40" fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
    <path d="M-95 -50 H95 L80 110 H-80 Z" fill={col} filter="url(#soft)" />
    <path d="M-95 -50 H95 L80 110 H-80 Z" fill="url(#shade)" />
  </G>
);

export const CardIcon: React.FC<P & { col?: string }> = ({ col = C.primary, ...p }) => (
  <G {...p}>
    <rect x={-150} y={-95} width={300} height={190} rx={22} fill={col} filter="url(#soft)" />
    <rect x={-150} y={-55} width={300} height={36} fill={C.ink} opacity={0.85} />
    <rect x={-120} y={20} width={56} height={40} rx={8} fill={C.amber} />
    <rect x={10} y={40} width={110} height={14} rx={7} fill="#fff" opacity={0.7} />
  </G>
);

export const Bill: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-150} y={-75} width={300} height={150} rx={14} fill={C.mid} filter="url(#soft)" />
    <rect x={-132} y={-58} width={264} height={116} rx={10} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={4} />
    <circle r={38} fill={C.primary} />
    <Txt x={0} y={3} size={30} weight={900} fill="#fff">Rp</Txt>
  </G>
);

export const Ticket: React.FC<P & { col?: string }> = ({ col = C.amber, ...p }) => (
  <G {...p}>
    <path d="M-170 -80 H170 V-24 A24 24 0 0 0 170 24 V80 H-170 V24 A24 24 0 0 0 -170 -24 Z" fill={col} filter="url(#soft)" />
    <line x1={70} y1={-70} x2={70} y2={70} stroke={C.ink} strokeOpacity={0.35} strokeWidth={4} strokeDasharray="10 10" />
    <circle cx={-50} cy={0} r={44} fill="#E0762F" />
    <path d="M-94 0 H-6 M-50 -44 V44 M-81 -31 Q-50 0 -81 31 M-19 -31 Q-50 0 -19 31" stroke={C.ink} strokeWidth={4} fill="none" />
    <Txt x={120} y={2} size={26} weight={900} fill={C.ink}>VIP</Txt>
  </G>
);

export const Wallet: React.FC<P & { col?: string }> = ({ col = C.primary, ...p }) => (
  <G {...p}>
    <rect x={-150} y={-100} width={300} height={200} rx={30} fill={col} filter="url(#soft)" />
    <rect x={40} y={-40} width={130} height={80} rx={20} fill={C.deep} />
    <circle cx={90} cy={0} r={14} fill={C.amber} />
    <rect x={-150} y={-100} width={300} height={200} rx={30} fill="url(#shade)" />
  </G>
);

export const QR: React.FC<P> = (p) => {
  const cells: [number, number][] = [];
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (((i * 7 + j * 13) % 5 < 2) && !((i < 3 && j < 3) || (i < 3 && j > 5) || (i > 5 && j < 3))) cells.push([i, j]);
  const fp = (x: number, y: number) => (
    <g key={`${x}${y}`}><rect x={x} y={y} width={60} height={60} rx={8} fill={C.ink} /><rect x={x + 12} y={y + 12} width={36} height={36} rx={4} fill="#fff" /><rect x={x + 20} y={y + 20} width={20} height={20} rx={3} fill={C.ink} /></g>
  );
  return (
    <G {...p}>
      <rect x={-110} y={-110} width={220} height={220} rx={18} fill="#fff" filter="url(#soft)" />
      <g transform="translate(-90 -90)">
        {cells.map(([i, j]) => <rect key={`${i}-${j}`} x={j * 20} y={i * 20} width={18} height={18} rx={3} fill={C.ink} />)}
        {fp(0, 0)}{fp(120, 0)}{fp(0, 120)}
      </g>
    </G>
  );
};

export const Jar: React.FC<P & { level: number; label?: string }> = ({ level, label, ...p }) => (
  <G {...p}>
    <rect x={-80} y={-150} width={160} height={30} rx={10} fill={C.ink} />
    <path d="M-110 -110 H110 V120 A30 30 0 0 1 80 150 H-80 A30 30 0 0 1 -110 120 Z" fill="#fff" fillOpacity={0.55} stroke={C.ink} strokeWidth={6} />
    <clipPath id="jarclip"><path d="M-104 -104 H104 V118 A26 26 0 0 1 78 144 H-78 A26 26 0 0 1 -104 118 Z" /></clipPath>
    <rect x={-110} y={150 - 254 * clamp(level)} width={220} height={260} fill={C.mid} clipPath="url(#jarclip)" />
    {label && <Txt x={0} y={200} size={30} weight={800}>{label}</Txt>}
  </G>
);

export const Person: React.FC<P & { col?: string }> = ({ col = C.deep, ...p }) => (
  <G {...p}>
    <circle cx={0} cy={-34} r={26} fill={col} />
    <path d="M-40 40 C-40 -10 40 -10 40 40 Z" fill={col} />
  </G>
);

export const Check: React.FC<P & { col?: string }> = ({ col = C.primary, ...p }) => (
  <G {...p}>
    <circle r={60} fill={col} />
    <path d="M-28 2 L-8 24 L30 -22" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
  </G>
);

export const Cross: React.FC<P & { len?: number; col?: string }> = ({ len = 200, col = C.red, ...p }) => (
  <G {...p}>
    <rect x={-len / 2} y={-12} width={len} height={24} rx={12} fill={col} transform="rotate(45)" />
    <rect x={-len / 2} y={-12} width={len} height={24} rx={12} fill={col} transform="rotate(-45)" />
  </G>
);

export const Arrow: React.FC<{ d: string; p: number; col?: string; w?: number; len?: number; dash?: boolean }> = ({ d, p, col = C.ink, w = 8, len = 1400, dash }) => (
  <path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash ? '4 18' : `${len * clamp(p)} ${len}`} strokeDashoffset={dash ? -useContext(TimeCtx) * 40 : 0} opacity={dash ? clamp(p * 3) : 1} />
);

export const Cup: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M-80 -60 H80 L66 90 A20 20 0 0 1 46 108 H-46 A20 20 0 0 1 -66 90 Z" fill="#fff" stroke={C.ink} strokeWidth={6} />
    <rect x={-92} y={-84} width={184} height={30} rx={12} fill={C.deep} />
    <rect x={-74} y={-10} width={148} height={46} fill={C.primary} />
    <path d="M-20 -110 q12 -20 0 -40 M20 -110 q12 -20 0 -40" stroke={C.grey} strokeWidth={6} fill="none" strokeLinecap="round" />
  </G>
);

export const Bubble: React.FC<P & { w: number; h: number; text: string; fill?: string; tc?: string }> = ({ w, h, text, fill = '#fff', tc = C.ink, ...p }) => (
  <G {...p}>
    <path d={`M${-w / 2 + 30} ${-h / 2} H${w / 2 - 30} Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 30} V${h / 2 - 30} Q${w / 2} ${h / 2} ${w / 2 - 30} ${h / 2} H${-w / 2 + 110} L${-w / 2 + 50} ${h / 2 + 50} L${-w / 2 + 70} ${h / 2} H${-w / 2 + 30} Q${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 30} V${-h / 2 + 30} Q${-w / 2} ${-h / 2} ${-w / 2 + 30} ${-h / 2} Z`} fill={fill} filter="url(#soft)" />
    <Txt x={0} y={4} size={44} weight={800} fill={tc}>{text}</Txt>
  </G>
);
