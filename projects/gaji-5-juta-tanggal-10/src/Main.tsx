import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, continueRender, delayRender } from 'remotion';
import { C, FPS, W, H, CHAPTERS, WORDS, Defs, prog, clamp, easeInOut, FONT, TimeCtx, lerp } from './lib';
import { SCENES, darkWindows } from './Scenes';

const fontFiles: [string, string, string][] = [
  ['inter-latin-300-italic.woff2', '300', 'italic'],
  ['inter-latin-400-italic.woff2', '400', 'italic'],
  ['inter-latin-400-normal.woff2', '400', 'normal'],
  ['inter-latin-600-normal.woff2', '600', 'normal'],
  ['inter-latin-800-normal.woff2', '800', 'normal'],
  ['inter-latin-900-normal.woff2', '900', 'normal'],
];
let fontsReady = false;
const useFonts = () => {
  const [h] = React.useState(() => (fontsReady ? null : delayRender('fonts')));
  React.useEffect(() => {
    if (h === null) return;
    Promise.all(
      fontFiles.map(([f, w, s]) => {
        const ff = new FontFace(FONT, `url(${staticFile('fonts/' + f)})`, { weight: w, style: s });
        return ff.load().then((x) => (document as any).fonts.add(x));
      }),
    ).then(() => { fontsReady = true; continueRender(h); });
  }, [h]);
};

const DARK = darkWindows();

// camera beats: a new camera move at each sentence/clause start, at least 2.2s apart
const BEATS: number[] = (() => {
  const b: number[] = [];
  WORDS.forEach((w, i) => {
    const prev = WORDS[i - 1];
    if (!prev || /[.?!:,]"?$/.test(prev.text) || prev.bab !== w.bab) {
      if (!b.length || w.start - b[b.length - 1] >= 2.2) b.push(w.start - 0.15);
    }
  });
  return b;
})();
const SHOTS = [
  { s: 1.0, x: 0, y: 0, r: 0 },
  { s: 1.055, x: -38, y: 14, r: -0.9 },
  { s: 1.02, x: 34, y: -16, r: 0.8 },
  { s: 1.07, x: 10, y: 24, r: 0.4 },
  { s: 1.03, x: -24, y: -20, r: -0.5 },
];
const camera = (t: number) => {
  let k = 0;
  while (k < BEATS.length && BEATS[k] <= t) k++;
  const cur = SHOTS[k % SHOTS.length], prev = SHOTS[(k + SHOTS.length - 1) % SHOTS.length];
  const p = k === 0 ? 1 : easeInOut((t - BEATS[k - 1]) / 1.4);
  const kick = k === 0 ? 0 : Math.exp(-(t - BEATS[k - 1]) * 5) * 0.018;
  return {
    s: lerp(prev.s, cur.s, p) + kick + Math.sin(t * 0.35) * 0.008,
    x: lerp(prev.x, cur.x, p) + Math.sin(t * 0.23) * 14,
    y: lerp(prev.y, cur.y, p) + Math.cos(t * 0.19) * 10,
    r: lerp(prev.r, cur.r, p),
  };
};

// ambient floating shapes (parallax layer)
const AMB = Array.from({ length: 6 }).map((_, i) => ({
  x: (i * 397) % 1920, y: 120 + ((i * 331) % 860), r: 120 + ((i * 53) % 180), sp: 0.05 + (i % 5) * 0.025, kind: i % 3,
}));
const Ambient: React.FC<{ t: number; dark: boolean }> = ({ t, dark }) => (
  <g opacity={dark ? 0.06 : 0.04}>
    {AMB.map((a, i) => {
      const x = ((a.x + t * 40 * a.sp * 6) % 2240) - 160;
      const y = a.y + Math.sin(t * a.sp * 3 + i) * 60;
      const col = dark ? C.light : C.primary;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${t * 12 * a.sp * 4 + i * 30})`}>
          {a.kind === 0 && <circle r={a.r} fill={col} />}
          {a.kind === 1 && <circle r={a.r} fill="none" stroke={col} strokeWidth={6} />}
          {a.kind === 2 && <rect x={-a.r * 0.7} y={-a.r * 0.7} width={a.r * 1.4} height={a.r * 1.4} rx={a.r * 0.3} fill={col} />}
        </g>
      );
    })}
  </g>
);

export const Main: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // background: paper with circle wipes into deep green
  let darkR = 0, paperR = 0, isDark = false;
  for (const [a, b] of DARK) {
    if (t >= a && t < b + 0.6) {
      darkR = prog(t, a, 0.55, easeInOut) * 1300;
      paperR = t > b ? prog(t, b, 0.55, easeInOut) * 1300 : 0;
      isDark = t >= a + 0.2 && t < b + 0.2;
    }
  }
  // scene windows
  const scenes = CHAPTERS.map((ch, i) => {
    const next = CHAPTERS[i + 1];
    const a = ch.start - 0.4, b = next ? next.start - 0.35 : 1e9;
    if (t < a || t > b) return null;
    const S = SCENES[i];
    const cam = camera(t);
    return (
      <g key={i} transform={`translate(${960 + cam.x} ${540 + cam.y}) scale(${cam.s}) rotate(${cam.r}) translate(-960 -625)`}>
        <S t={t} />
      </g>
    );
  });
  // diagonal band sweep at chapter boundaries
  const bands = CHAPTERS.slice(1).map((ch, i) => {
    const mid = ch.start - 0.35;
    const p = (t - (mid - 0.35)) / 0.7;
    if (p < 0 || p > 1) return null;
    const x = -2600 + 5200 * easeInOut(p);
    return (
      <g key={i} transform={`translate(${x} 540) rotate(-14)`}>
        <rect x={-700} y={-1400} width={1400} height={2800} fill={C.primary} />
        <rect x={-760} y={-1400} width={60} height={2800} fill={C.mid} />
        <rect x={700} y={-1400} width={60} height={2800} fill={C.deep} />
      </g>
    );
  });
  return (
    <TimeCtx.Provider value={t}>
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Audio src={staticFile('vo.wav')} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
        <Defs />
        <defs>
          <radialGradient id="vig" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
            <stop offset="55%" stopColor={C.paper} stopOpacity={0} />
            <stop offset="100%" stopColor={C.paperEdge} stopOpacity={1} />
          </radialGradient>
          <radialGradient id="vigD" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor={C.deep2} />
            <stop offset="100%" stopColor="#051C14" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill={C.paper} />
        <rect width={W} height={H} fill="url(#vig)" />
        {darkR > 0 && <circle cx={960} cy={600} r={darkR} fill="url(#vigD)" />}
        {paperR > 0 && (
          <g>
            <clipPath id="pc"><circle cx={960} cy={600} r={paperR} /></clipPath>
            <g clipPath="url(#pc)"><rect width={W} height={H} fill={C.paper} /><rect width={W} height={H} fill="url(#vig)" /></g>
          </g>
        )}
        <Ambient t={t} dark={isDark} />
        {scenes}
        {bands}
      </svg>
      <Img src={staticFile('grain.png')} style={{ position: 'absolute', width: W, height: H, opacity: 0.07, mixBlendMode: 'multiply' }} />
    </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
