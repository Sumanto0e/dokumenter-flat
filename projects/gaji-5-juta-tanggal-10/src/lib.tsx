import React from 'react';
import data from './words.json';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Palette: "uang" green family + ink. One hue family like the reference, never purple.
export const C = {
  paper: '#F4F2EC',
  paperEdge: '#C9C5BB',
  ink: '#0D1F18',
  deep: '#0B3A2A',
  deep2: '#14573F',
  primary: '#13804F',
  mid: '#3DB57E',
  light: '#A9DDBF',
  pale: '#DDF1E5',
  grey: '#9AA39E',
  amber: '#F2B233',
  red: '#D64A3A',
  white: '#FFFFFF',
};

export const FONT = 'InterX';

export type Word = { bab: number; text: string; start: number; end: number; brk: boolean };
export const WORDS: Word[] = (data as any).words;
export const CHAPTERS: { bab: number; start: number; end: number }[] = (data as any).chapters;
export const TOTAL: number = (data as any).total;

const norm = (s: string) => s.toLowerCase().replace(/^[^\w%]+|[^\w%]+$/g, '');

/** Time (s) of the n-th word in a chapter whose normalized text equals key. */
export const cue = (bab: number, key: string, n = 0, which: 'start' | 'end' = 'start'): number => {
  const k = norm(key);
  const hits = WORDS.filter((w) => w.bab === bab && norm(w.text) === k);
  if (!hits[n]) throw new Error(`cue not found: bab ${bab} "${key}" #${n}`);
  return hits[n][which];
};
export const chap = (bab: number) => CHAPTERS[bab - 1];

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInOut = (x: number) => {
  x = clamp(x);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const backOut = (x: number) => {
  x = clamp(x);
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** 0..1 progress starting at t0 over d seconds */
export const prog = (t: number, t0: number, d = 0.5, fn = easeOut) => fn((t - t0) / d);
export const pop = (t: number, t0: number, d = 0.45) => backOut((t - t0) / d);
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
/** visible window: fades in at a, out at b */
export const win = (t: number, a: number, b: number, f = 0.3) =>
  clamp((t - a) / f) * (1 - clamp((t - b) / f));

export const rupiah = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

export const Txt: React.FC<{
  x: number; y: number; size?: number; weight?: number; fill?: string; anchor?: 'start' | 'middle' | 'end';
  italic?: boolean; children: React.ReactNode; opacity?: number; ls?: number;
}> = ({ x, y, size = 32, weight = 700, fill = C.ink, anchor = 'middle', italic, children, opacity = 1, ls = 0 }) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor}
    fontStyle={italic ? 'italic' : 'normal'} opacity={opacity} letterSpacing={ls} dominantBaseline="middle">
    {children}
  </text>
);

/** pill label chip */
export const Chip: React.FC<{ x: number; y: number; label: string; w?: number; fill?: string; color?: string; size?: number; s?: number; o?: number }> = ({
  x, y, label, w, fill = C.primary, color = C.white, size = 30, s = 1, o = 1,
}) => {
  const ww = w ?? label.length * size * 0.58 + 48;
  const hh = size * 1.9;
  const tt = React.useContext(TimeCtx);
  return (
    <g transform={`translate(${x} ${y + Math.sin(tt * 1.8 + x * 0.01) * 5}) scale(${s})`} opacity={o}>
      <rect x={-ww / 2} y={-hh / 2} width={ww} height={hh} rx={hh / 2} fill={fill} />
      <Txt x={0} y={2} size={size} fill={color} weight={700}>{label}</Txt>
    </g>
  );
};

/** dark round "token" icon holder like the reference's chip characters */
export const Badge: React.FC<{ x: number; y: number; r?: number; s?: number; fill?: string; ring?: boolean; children?: React.ReactNode }> = ({
  x, y, r = 56, s = 1, fill = C.deep, ring = true, children,
}) => {
  const tt = React.useContext(TimeCtx);
  const pulse = 1 + 0.12 * ((tt * 0.8) % 1);
  return (
  <g transform={`translate(${x} ${y + Math.sin(tt * 1.5 + x * 0.01) * 6}) scale(${s})`}>
    {ring && <circle r={(r + 14) * pulse} fill="none" stroke={C.ink} strokeOpacity={0.14 * (1 - ((tt * 0.8) % 1))} strokeWidth={3} />}
    {ring && <circle r={r + 14} fill="none" stroke={C.ink} strokeOpacity={0.12} strokeWidth={2} />}
    <circle r={r} fill={fill} />
    <circle r={r} fill="url(#gloss)" />
    {children}
  </g>
  );
};

/** shared SVG defs */
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="gloss" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#fff" stopOpacity={0.28} />
      <stop offset="60%" stopColor="#fff" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fff" stopOpacity={0.25} />
      <stop offset="100%" stopColor="#000" stopOpacity={0.12} />
    </linearGradient>
    <linearGradient id="greenV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={C.mid} />
      <stop offset="100%" stopColor={C.primary} />
    </linearGradient>
    <linearGradient id="paperCard" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="100%" stopColor="#E9E6DE" />
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#0D1F18" floodOpacity="0.22" />
    </filter>
  </defs>
);

/** global time context so every component can idle-animate */
export const TimeCtx = React.createContext(0);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);

/** phase transition: zoom-through in & out, SaaS-promo style */
export const ph = (t: number, w: [number, number]) => {
  const [a, b] = w;
  const i = a < -50 ? 1 : easeOut((t - a) / 0.75);
  const o = b > 1e8 ? 0 : easeIn((t - (b - 0.2)) / 0.5);
  const s = lerp(0.72, 1, i) * lerp(1, 1.7, o);
  const r = lerp(-5, 0, i) + lerp(0, 4, o);
  const y = lerp(70, 0, i) + lerp(0, -40, o);
  return {
    opacity: clamp(i * 1.8) * (1 - o),
    transform: `translate(960 ${600 + y}) rotate(${r}) scale(${s}) translate(-960 -600)`,
  };
};
