import React from 'react';
import { staticFile } from 'remotion';
import { C, Txt, cue, chap, prog, pop, lerp, clamp, rupiah, easeInOut, easeOut, easeIn, FONT } from './lib';

/* ---------- asset images ---------- */
const SIZES: Record<string, [number, number]> = {
  hand_phone: [1024, 1478], hand_pinch: [959, 1328], bag: [1212, 1282], wallet: [1512, 983], hand_coin: [905, 1496],
  bill: [1600, 807], cup: [986, 1500], tower: [747, 1518], hand_cash: [1505, 961],
};
/** image centered at x,y with given width */
export const Pic: React.FC<{ n: string; x: number; y: number; w: number; r?: number; o?: number; sx?: number; sy?: number; shadow?: boolean }> = ({
  n, x, y, w, r = 0, o = 1, sx = 1, sy = 1, shadow = true,
}) => {
  const [iw, ih] = SIZES[n];
  const h = (w * ih) / iw;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${sx} ${sy})`} opacity={o}>
      <image href={staticFile(`img/${n}.png`)} x={-w / 2} y={-h / 2} width={w} height={h} filter={shadow ? 'url(#soft)' : undefined} />
    </g>
  );
};

/* ---------- shot wrapper: every shot enters & exits with camera motion ---------- */
type Tr = 'zoom' | 'left' | 'up' | 'down';
export const Shot: React.FC<{ t: number; a: number; b: number; inn?: Tr; out?: Tr; push?: number; children: React.ReactNode }> = ({
  t, a, b, inn = 'zoom', out = 'zoom', push = 0.06, children,
}) => {
  if (t < a - 0.05 || t > b + 0.5) return null;
  const i = easeOut((t - a) / 0.55);
  const o = easeIn((t - b) / 0.45);
  const p = clamp((t - a) / Math.max(0.1, b - a));
  let tx = 0, ty = 0, s = 1 + push * easeInOut(p), r = 0;
  const apply = (k: Tr, v: number, sign: number) => {
    if (k === 'zoom') { s *= sign > 0 ? lerp(1.35, 1, v) : lerp(1, 0.6, v); r += sign > 0 ? lerp(-4, 0, v) : lerp(0, 5, v); }
    if (k === 'left') tx += sign > 0 ? lerp(1500, 0, v) : lerp(0, -1700, v);
    if (k === 'up') ty += sign > 0 ? lerp(1100, 0, v) : lerp(0, -1200, v);
    if (k === 'down') ty += sign > 0 ? lerp(-1100, 0, v) : lerp(0, 1200, v);
  };
  apply(inn, i, 1);
  if (t > b) apply(out, o, -1);
  const op = clamp(i * 3) * (out === 'zoom' ? 1 - o : 1);
  return (
    <g opacity={op} transform={`translate(${960 + tx} ${540 + ty}) rotate(${r}) scale(${s}) translate(-960 -540)`}>
      {children}
    </g>
  );
};

/* ---------- set: wall + floor + moving light beams ---------- */
export const Room: React.FC<{ t: number; floorY?: number; floor?: string; wall?: string; beams?: boolean; dark?: boolean }> = ({
  t, floorY = 860, floor = C.light, wall, beams = true, dark,
}) => (
  <g>
    {wall && <rect x={-400} y={-400} width={2720} height={floorY + 400} fill={wall} />}
    <rect x={-400} y={floorY} width={2720} height={800} fill={floor} />
    <rect x={-400} y={floorY} width={2720} height={10} fill="#000" opacity={0.08} />
    {beams &&
      [0, 1, 2].map((k) => {
        const x = ((k * 760 + t * 30) % 2600) - 500;
        return <polygon key={k} points={`${x},-200 ${x + 260},-200 ${x + 900},${floorY} ${x + 420},${floorY}`} fill="#fff" opacity={dark ? 0.04 : 0.22} />;
      })}
  </g>
);

/* ---------- money particles with 3D flip ---------- */
const rnd = (i: number, k: number) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
/** bills that burst/fall from (ox,oy). mode: burst (up then fall) | rain (from top) | stream (towards dx) */
export const Bills: React.FC<{ t: number; t0: number; n?: number; ox?: number; oy?: number; mode?: 'burst' | 'rain' | 'stream'; w?: number; dx?: number }> = ({
  t, t0, n = 16, ox = 960, oy = 540, mode = 'burst', w = 230, dx = 1400,
}) => {
  if (t < t0) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const d = t - t0 - rnd(i, 1) * (mode === 'rain' ? 2.5 : 0.5);
        if (d < 0) return null;
        let x = 0, y = 0;
        if (mode === 'burst') {
          const vx = (rnd(i, 2) - 0.5) * 1500, vy = -700 - rnd(i, 3) * 700;
          x = ox + vx * d * 0.8 + Math.sin(d * 3 + i) * 60;
          y = oy + vy * d + 0.5 * 1300 * d * d * 0.8;
        } else if (mode === 'rain') {
          x = rnd(i, 2) * 2100 - 90 + Math.sin(d * 2 + i) * 90;
          y = -200 + d * (420 + rnd(i, 3) * 260);
        } else {
          const p = d / 1.6;
          x = ox + (dx - ox) * p + Math.sin(d * 4 + i) * 40;
          y = oy + (rnd(i, 3) - 0.5) * 420 * p - Math.sin(p * Math.PI) * 160;
        }
        if (y > 1400 || x < -400 || x > 2400) return null;
        const flip = Math.cos(d * (4 + rnd(i, 4) * 4) + i);
        const rot = (rnd(i, 5) - 0.5) * 120 + d * (rnd(i, 6) - 0.5) * 200;
        const ww = w * (0.7 + rnd(i, 7) * 0.6);
        return (
          <g key={i}>
            <Pic n="bill" x={x} y={y} w={ww} r={rot} sy={Math.max(0.08, Math.abs(flip))} shadow={false} o={flip < 0 ? 0.85 : 1} />
          </g>
        );
      })}
    </g>
  );
};

/* ---------- extruded 3D-ish text ---------- */
export const Extrude: React.FC<{ x: number; y: number; size: number; text: string; face?: string; side?: string; depth?: number; r?: number; s?: number }> = ({
  x, y, size, text, face = '#F4F2EC', side = C.deep2, depth = 18, r = 0, s = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    {Array.from({ length: depth }).map((_, k) => (
      <text key={k} x={depth - k} y={depth - k} fontFamily={FONT} fontWeight={900} fontSize={size} fill={side} textAnchor="middle" dominantBaseline="middle">{text}</text>
    ))}
    <text x={0} y={0} fontFamily={FONT} fontWeight={900} fontSize={size} fill={face} textAnchor="middle" dominantBaseline="middle">{text}</text>
  </g>
);

/* ---------- big cropped clock (like the reference gauge) ---------- */
export const BigClock: React.FC<{ x: number; y: number; R: number; h: number; m: number; t: number }> = ({ x, y, R, h, m, t }) => {
  const ma = (m / 60) * 360, ha = ((h % 12) / 12) * 360 + (m / 60) * 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={R + 40} fill={C.ink} filter="url(#soft)" />
      <circle r={R} fill="#FBFAF7" />
      <circle r={R} fill="url(#shade)" opacity={0.6} />
      {Array.from({ length: 60 }).map((_, i) => (
        <rect key={i} x={-3} y={-R + 18} width={i % 5 ? 6 : 12} height={i % 5 ? 26 : 60} fill={C.ink} transform={`rotate(${i * 6})`} />
      ))}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = ((i + 1) / 12) * Math.PI * 2;
        return <Txt key={i} x={Math.sin(a) * (R - 130)} y={-Math.cos(a) * (R - 130)} size={R * 0.13} weight={800}>{`${i + 1}`}</Txt>;
      })}
      <rect x={-16} y={-R * 0.5} width={32} height={R * 0.58} rx={16} fill={C.ink} transform={`rotate(${ha})`} />
      <rect x={-10} y={-R * 0.82} width={20} height={R * 0.9} rx={10} fill={C.primary} transform={`rotate(${ma})`} />
      <rect x={-4} y={-R * 0.88} width={8} height={R * 1.05} rx={4} fill={C.red} transform={`rotate(${(t * 120) % 360})`} />
      <circle r={36} fill={C.primary} /><circle r={14} fill="#FBFAF7" />
    </g>
  );
};

/* ---------- calendar with flipping pages: f in [0,9] -> day 1..10 ---------- */
export const FlipCal: React.FC<{ x: number; y: number; w: number; f: number; hl?: string; top?: string; label?: (d: number) => string }> = ({ x, y, w, f, hl = C.primary, top = 'NOV', label }) => {
  const h = w * 1.1;
  const ff = clamp(f, 0, 9);
  const n = Math.floor(ff + 1e-6);
  const frac = ff - n;
  const cur = Math.min(10, n + 1), next = Math.min(10, n + 2);
  const q = n >= 9 ? 0 : easeIn(clamp((frac - 0.45) / 0.55));
  const txt = (d: number) => (label ? label(d) : `${d}`);
  const page = (d: number, rot = 0, sy = 1, o = 1) => (
    <g transform={`translate(0 ${-h / 2 + h * 0.22}) rotate(${rot}) scale(1 ${sy}) translate(0 ${h / 2 - h * 0.22})`} opacity={o}>
      <rect x={-w / 2} y={-h / 2 + h * 0.2} width={w} height={h * 0.8} rx={24} fill="url(#paperCard)" />
      <Txt x={0} y={h * 0.1} size={w * 0.5} weight={900} fill={d >= 10 ? C.red : C.ink}>{txt(d)}</Txt>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h / 2 + 14} width={w} height={h} rx={24} fill="#D9D5CA" filter="url(#soft)" />
      {page(q > 0 ? next : cur)}
      {q > 0 && page(cur, -q * 25, Math.max(0.02, 1 - q), 1 - q * 0.6)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.22} rx={24} fill={hl} />
      <rect x={-w / 2} y={-h / 2 + h * 0.12} width={w} height={h * 0.1} fill={hl} />
      <Txt x={0} y={-h / 2 + h * 0.11} size={w * 0.12} weight={900} fill="#fff" ls={4}>{top}</Txt>
      {[-1, 1].map((sgn) => <rect key={sgn} x={sgn * w * 0.25 - 12} y={-h / 2 - 30} width={24} height={70} rx={12} fill={C.ink} />)}
    </g>
  );
};

/* ---------- conveyor ---------- */
export const Conveyor: React.FC<{ y: number; t: number; speed?: number }> = ({ y, t, speed = 260 }) => {
  const off = (t * speed) % 120;
  return (
    <g>
      <rect x={-300} y={y} width={2520} height={70} rx={35} fill={C.ink} />
      {Array.from({ length: 24 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 120 - off - 200} ${y + 35})`}>
          <circle r={22} fill="#2B3A33" /><circle r={8} fill="#9AA39E" />
          <rect x={-3} y={-20} width={6} height={40} fill="#9AA39E" transform={`rotate(${t * speed * 2})`} />
        </g>
      ))}
      {[0, 1, 2, 3].map((k) => <rect key={k} x={260 + k * 480} y={y + 70} width={18} height={300} fill={C.ink} />)}
    </g>
  );
};

/* ================= BAB 1 (v2) ================= */
export const Bab1v2: React.FC<{ t: number }> = ({ t }) => {
  const c = chap(1);
  const tGaj = cue(1, 'gajian'), tJam10 = cue(1, '10', 0), tTgl = cue(1, 'tanggal', 0), t66 = cue(1, 'rp66');
  const tPad = cue(1, 'padahal'), tKalau = cue(1, 'kalau'), tKita = cue(1, 'kita', 0), tLacak = cue(1, 'lacak');
  const tDari = cue(1, 'dari', 0), tDi = cue(1, 'di'), tMana = cue(1, 'mana'), tDan = cue(1, 'dan'), tCara = cue(1, 'cara');
  const tMulai = cue(1, 'kita', 1);
  const bal = (() => {
    let v = 5000000 * prog(t, tGaj - 0.2, 1.0, easeOut);
    v = lerp(v, 1470000, prog(t, tJam10 + 0.3, 1.6, easeInOut));
    v = lerp(v, 66000, prog(t, tTgl + 0.4, 2.6, easeInOut));
    return v;
  })();
  const screen = (x: number, y: number, w: number) => {
    // phone screen overlay mapped onto hand_phone asset (screen ≈ 47% width, centered slightly left/up)
    const sw = w * 0.47, sh = w * 1.0;
    return (
      <g transform={`translate(${x - w * 0.003} ${y - w * 0.136})`}>
        <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} rx={sw * 0.12} fill="#FBFAF7" />
        <Txt x={0} y={-sh * 0.3} size={sw * 0.07} weight={600} fill={C.grey}>Saldo rekening</Txt>
        <Txt x={0} y={-sh * 0.22} size={sw * 0.115} weight={900} fill={bal < 100000 ? C.red : C.ink}>{rupiah(bal)}</Txt>
        <rect x={-sw * 0.38} y={-sh * 0.14} width={sw * 0.76} height={sw * 0.035} rx={6} fill={C.pale} />
        <rect x={-sw * 0.38} y={-sh * 0.14} width={sw * 0.76 * (bal / 5000000)} height={sw * 0.035} rx={6} fill={bal < 100000 ? C.red : C.primary} />
        {[0, 1, 2, 3].map((k) => (
          <g key={k} opacity={prog(t, tGaj + 0.6 + k * 0.15, 0.3)}>
            <rect x={-sw * 0.4} y={-sh * 0.06 + k * sh * 0.13} width={sw * 0.8} height={sh * 0.1} rx={14} fill="#EEECE6" />
            <circle cx={-sw * 0.3} cy={-sh * 0.01 + k * sh * 0.13} r={sw * 0.045} fill={k === 0 ? C.primary : C.red} opacity={0.8} />
            <rect x={-sw * 0.2} y={-sh * 0.025 + k * sh * 0.13} width={sw * 0.35} height={sw * 0.035} rx={5} fill="#D5D2CA" />
          </g>
        ))}
        {/* notification drop */}
        <g transform={`translate(0 ${lerp(-sh * 0.62, -sh * 0.4, pop(t, tGaj, 0.5))})`} opacity={clamp((t - tGaj) * 4) * (1 - prog(t, tGaj + 2.2, 0.4))}>
          <rect x={-sw * 0.45} y={-sh * 0.05} width={sw * 0.9} height={sh * 0.1} rx={18} fill={C.ink} />
          <Txt x={0} y={0} size={sw * 0.06} weight={800} fill="#fff">Gaji masuk +Rp5.000.000</Txt>
        </g>
      </g>
    );
  };
  return (
    <g>
      {/* S1: hand + phone, salary lands, money bursts */}
      <Shot t={t} a={c.start - 0.4} b={tJam10 - 0.15} inn="up" out="left" push={0.08}>
        <Room t={t} floor={C.light} />
        <Bills t={t} t0={tGaj + 0.15} n={18} ox={960} oy={520} mode="burst" w={240} />
        <Pic n="hand_phone" x={1000} y={700} w={820} />
        {screen(1000, 700, 820)}
      </Shot>
      {/* S2: giant clock cropped left + phone right, money streams out */}
      <Shot t={t} a={tJam10 - 0.15} b={tTgl - 0.1} inn="left" out="zoom" push={0.05}>
        <Room t={t} floor={C.pale} />
        <BigClock x={180} y={560} R={560} t={t} h={9 + prog(t, tJam10, 0.9, easeInOut)} m={prog(t, tJam10, 0.9, easeInOut) * 60 % 60} />
        <Bills t={t} t0={tJam10 + 0.3} n={14} ox={1380} oy={430} mode="stream" dx={2300} w={200} />
        <Pic n="hand_phone" x={1420} y={760} w={640} r={-6} />
        <g transform={`rotate(-6 1420 760)`}>{screen(1420, 760, 640)}</g>
      </Shot>
      {/* S3: dark, calendar flips 1..10, balance hits 66rb */}
      <Shot t={t} a={tTgl - 0.1} b={tPad - 0.2} inn="zoom" out="down" push={0.1}>
        <FlipCal x={800} y={560} w={560} f={clamp((t - tTgl) / (t66 - tTgl)) * 9} hl={C.red} />
        <g transform={`translate(1450 ${lerp(900, 560, pop(t, t66, 0.6))})`} opacity={clamp((t - t66) * 4)}>
          <rect x={-300} y={-110} width={600} height={220} rx={40} fill={C.red} filter="url(#soft)" />
          <Txt x={0} y={-30} size={38} weight={700} fill="#fff">sisa saldo</Txt>
          <Txt x={0} y={40} size={96} weight={900} fill="#fff" ls={-2}>Rp66.000</Txt>
        </g>
      </Shot>
      {/* S4: dark, huge empty wallet, dust floats out */}
      <Shot t={t} a={tPad - 0.2} b={tKalau - 0.15} inn="down" out="zoom" push={0.14}>
        <Pic n="wallet" x={960} y={600} w={1300} r={lerp(-8, 0, prog(t, tPad, 1.2))} />
        {Array.from({ length: 14 }).map((_, i) => {
          const d = t - tPad - rnd(i, 1) * 1.5;
          if (d < 0) return null;
          return <circle key={i} cx={760 + rnd(i, 2) * 400 + Math.sin(d * 2 + i) * 30} cy={460 - d * 120} r={4 + rnd(i, 3) * 6} fill={C.light} opacity={clamp(1 - d / 2.5) * 0.8} />;
        })}
      </Shot>
      {/* S5: tower lowered by crane, windows light up, one is "kamu" */}
      <Shot t={t} a={tKalau - 0.15} b={tKita - 0.15} inn="zoom" out="up" push={0.07}>
        <Room t={t} floor={C.primary} floorY={900} />
        {(() => {
          const dy = lerp(-1100, 0, easeOut((t - tKalau) / 1.4));
          const sw = Math.sin(t * 2) * 2 * (1 - prog(t, tKalau + 1.2, 0.6));
          return (
            <g>
              <rect x={300} y={-200} width={36} height={1100} fill={C.ink} />
              <rect x={120} y={120} width={1100} height={40} fill={C.ink} />
              {Array.from({ length: 18 }).map((_, k) => <line key={k} x1={140 + k * 60} y1={120} x2={170 + k * 60} y2={160} stroke={C.paper} strokeWidth={4} />)}
              <line x1={960} y1={160} x2={960} y2={380 + dy * 0.3} stroke={C.ink} strokeWidth={5} opacity={1 - prog(t, tKalau + 1.6, 0.5)} />
              <g transform={`translate(0 ${dy}) rotate(${sw} 960 520)`}>
                <Pic n="tower" x={960} y={520 + 140} w={470} />
                {[2, 5, 8].map((row, k) => (
                  <rect key={k} x={830 + (k % 2) * 165} y={160 + row * 62} width={60} height={46} fill={C.amber} opacity={prog(t, tKalau + 1.4 + k * 0.3, 0.3) * 0.75} />
                ))}
              </g>
              <g opacity={prog(t, cue(1, 'buat', 0), 0.3)} transform={`translate(1360 ${520})`}>
                <rect x={-150} y={-46} width={300} height={92} rx={46} fill={C.ink} />
                <Txt x={0} y={3} size={40} weight={900} fill="#fff">ini kamu</Txt>
                <path d="M-150 0 L-330 -40" stroke={C.ink} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" strokeDashoffset={-t * 40} />
              </g>
            </g>
          );
        })()}
      </Shot>
      {/* S6: conveyor tracking: bills ride the belt past dates 1..10 */}
      <Shot t={t} a={tKita - 0.15} b={tDi - 0.2} inn="up" out="zoom" push={0.04}>
        <Room t={t} floor={C.light} floorY={880} />
        {(() => {
          const scroll = (t - tKita) * 210;
          return (
            <g>
              {Array.from({ length: 10 }).map((_, i) => {
                const x = 400 + i * 520 - scroll;
                return (
                  <g key={i} transform={`translate(${x} 300)`}>
                    <rect x={-90} y={-70} width={180} height={140} rx={24} fill={i === 9 ? C.red : C.ink} />
                    <Txt x={0} y={-25} size={26} weight={700} fill="#fff" opacity={0.7}>tanggal</Txt>
                    <Txt x={0} y={22} size={64} weight={900} fill="#fff">{`${i + 1}`}</Txt>
                    <line x1={0} y1={70} x2={0} y2={330} stroke={C.ink} strokeWidth={4} strokeDasharray="6 12" />
                  </g>
                );
              })}
              <Conveyor y={760} t={t} speed={210} />
              {Array.from({ length: 12 }).map((_, i) => {
                const x = ((i * 330 + (t - tKita) * 210 * 0 + 0) % 4000) - scroll * 0 - 200 + (t - tKita) * 0;
                const bx = 200 + i * 330 - ((t - tKita) * 210) % 330;
                return <Pic key={i} n="bill" x={bx} y={700 + Math.sin(t * 3 + i) * 4} w={260} r={-3 + (i % 3) * 3} sy={0.55} shadow />;
              })}
              <g transform={`translate(${lerp(300, 1500, prog(t, tLacak, 5, easeInOut))} 640) rotate(${Math.sin(t * 1.5) * 8})`} opacity={prog(t, tLacak, 0.3)}>
                <circle r={150} fill="#fff" fillOpacity={0.25} stroke={C.ink} strokeWidth={26} />
                <circle r={150} fill="url(#gloss)" />
                <rect x={110} y={110} width={220} height={52} rx={26} fill={C.ink} transform="rotate(45 110 110)" />
              </g>
            </g>
          );
        })()}
      </Shot>
      {/* S7: big extruded "?" with bills orbiting */}
      <Shot t={t} a={tDi - 0.2} b={tDan - 0.15} inn="zoom" out="left" push={0.12}>
        <Room t={t} floor={C.primary} floorY={900} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = t * 1.3 + (i / 8) * Math.PI * 2;
          const z = Math.sin(a);
          return z < 0 ? <Pic key={i} n="bill" x={960 + Math.cos(a) * 520} y={520 + z * 120} w={200} r={Math.cos(a) * 30} sy={0.6} shadow={false} o={0.6} /> : null;
        })}
        <Extrude x={960} y={520} size={640} text="?" face={C.primary} side={C.deep} depth={26} r={Math.sin(t * 1.4) * 8} s={pop(t, tDi, 0.7)} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = t * 1.3 + (i / 8) * Math.PI * 2;
          const z = Math.sin(a);
          return z >= 0 ? <Pic key={i} n="bill" x={960 + Math.cos(a) * 520} y={520 + z * 120} w={240} r={Math.cos(a) * 30} sy={0.6} /> : null;
        })}
      </Shot>
      {/* S8: hand drops a coin; calendar 10 gets a check */}
      <Shot t={t} a={tDan - 0.15} b={tMulai - 0.15} inn="left" out="zoom" push={0.06}>
        <Room t={t} floor={C.light} floorY={900} />
        <FlipCal x={1300} y={560} w={440} f={9} hl={C.primary} />
        <g opacity={prog(t, tCara + 1.2, 0.3)} transform={`translate(1500 360) scale(${pop(t, tCara + 1.2)})`}>
          <circle r={80} fill={C.primary} />
          <path d="M-38 2 L-10 30 L40 -28" fill="none" stroke="#fff" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {(() => {
          const rel = tCara + 0.5;
          const handY = lerp(-500, 180, prog(t, tDan, 0.9, easeOut)) - prog(t, rel + 0.15, 0.8, easeIn) * 800;
          const d = t - rel;
          const cy0 = lerp(-500, 180, prog(t, tDan, 0.9, easeOut)) + 66;
          const cy = d < 0 ? cy0 : Math.min(830, cy0 + 0.5 * 2600 * d * d);
          const spin = d < 0 ? 1 : 0.35 + 0.65 * Math.abs(Math.cos(d * 9));
          return (
            <g>
              <Pic n="hand_pinch" x={600} y={handY - 300} w={520} />
              <g transform={`translate(649 ${cy}) scale(${spin} 1)`}>
                <circle r={70} fill="#B9821B" cy={8} /><circle r={70} fill={C.amber} /><circle r={52} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={6} />
                <Txt x={0} y={3} size={44} weight={900} fill="#7A5208">Rp</Txt>
              </g>
            </g>
          );
        })()}
        <ellipse cx={649} cy={900} rx={240} ry={40} fill={C.deep} opacity={0.2 * prog(t, tCara + 0.8, 0.3)} />
      </Shot>
      {/* S9: dive into the clock (hands over to bab 2) */}
      <Shot t={t} a={tMulai - 0.15} b={c.end + 0.6} inn="zoom" out="zoom" push={0.25}>
        <Room t={t} floor={C.pale} />
        <BigClock x={960} y={560} R={420} t={t} h={9} m={0} />
      </Shot>
    </g>
  );
};
