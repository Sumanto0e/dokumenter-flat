import React from 'react';
import { C, Txt, cue, chap, prog, pop, lerp, clamp, rupiah, easeInOut, easeOut, easeIn, FONT } from './lib';
import { Pic, Shot, Room, Bills, Extrude, BigClock, FlipCal, Conveyor } from './v2';
import { Envelope, Donut, Gauge, QR, CardIcon, Ticket, Jar, Person, Check, Cross } from './components';

type S = { t: number };
const rnd = (i: number, k: number) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

/* ---------- shared big pieces ---------- */
const Tag: React.FC<{ x: number; y: number; t: number; t0: number; top: string; amt: string; col?: string; s?: number }> = ({ x, y, t, t0, top, amt, col = C.red, s = 1 }) => {
  if (t < t0) return null;
  const sw = Math.sin((t - t0) * 5) * 14 * Math.exp(-(t - t0) * 1.2) + Math.sin(t * 1.3) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(t, t0, 0.5) * s}) rotate(${sw})`}>
      <line x1={0} y1={-260} x2={0} y2={-120} stroke={C.ink} strokeWidth={5} />
      <path d="M-220 -120 H220 V150 A30 30 0 0 1 190 180 H-190 A30 30 0 0 1 -220 150 Z" fill={col} filter="url(#soft)" />
      <circle cx={0} cy={-80} r={18} fill="#F4F2EC" />
      <Txt x={0} y={-10} size={40} weight={700} fill="#fff">{top}</Txt>
      <Txt x={0} y={80} size={84} weight={900} fill="#fff" ls={-2}>{amt}</Txt>
    </g>
  );
};
const PhoneScreen: React.FC<{ x: number; y: number; w: number; r?: number; children: React.ReactNode }> = ({ x, y, w, r = 0, children }) => {
  const sw = w * 0.47, sh = w * 1.0;
  return (
    <g transform={`rotate(${r} ${x} ${y})`}>
      <Pic n="hand_phone" x={x} y={y} w={w} />
      <g transform={`translate(${x - w * 0.003} ${y - w * 0.136}) scale(${sw / 400})`}>
        <rect x={-200} y={-425} width={400} height={850} rx={46} fill="#FBFAF7" />
        {children}
      </g>
    </g>
  );
};
const Wifi: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2].map((k) => {
      const R = 120 + k * 120, a = 0.55;
      const on = (Math.floor(t * 3) % 4) > k ? 1 : 0.3;
      return <path key={k} d={`M${-R * Math.sin(a)} ${-R * Math.cos(a)} A${R} ${R} 0 0 1 ${R * Math.sin(a)} ${-R * Math.cos(a)}`} stroke={C.primary} strokeWidth={60} fill="none" strokeLinecap="round" opacity={on} />;
    })}
    <circle cx={0} cy={0} r={46} fill={C.primary} />
  </g>
);
const Stamp: React.FC<{ x: number; y: number; t: number; t0: number; text: string; col?: string; r?: number; size?: number }> = ({ x, y, t, t0, text, col = C.red, r = -8, size = 64 }) => {
  if (t < t0) return null;
  const s = lerp(2.2, 1, easeOut((t - t0) / 0.25));
  const w = text.length * size * 0.62 + 80;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={clamp((t - t0) * 6)}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={18} fill="none" stroke={col} strokeWidth={12} />
      <Txt x={0} y={4} size={size} weight={900} fill={col} ls={3}>{text}</Txt>
    </g>
  );
};
const BigNum: React.FC<{ x: number; y: number; text: string; t: number; t0: number; size?: number; face?: string; side?: string }> = ({ x, y, text, t, t0, size = 260, face = C.ink, side = C.primary }) =>
  t < t0 ? null : <Extrude x={x} y={y} size={size} text={text} face={face} side={side} depth={16} s={pop(t, t0, 0.6)} r={Math.sin(t * 1.2) * 2} />;

/* ================= BAB 2 ================= */
export const Bab2v: React.FC<S> = ({ t }) => {
  const c = chap(2);
  const tNotif = cue(2, 'notif'), tLima = cue(2, 'lima', 0), tKos = cue(2, 'kos'), tLima2 = cue(2, 'lima', 1), tIbu = cue(2, 'ibu');
  const tJam = cue(2, 'jam', 1), tKep = cue(2, 'kepotong'), tLalu = cue(2, 'lalu'), tPay = cue(2, 'paylater'), tDit = cue(2, 'ditambah');
  const tInt = cue(2, 'internet'), tBel = cue(2, 'belum', 0), t35 = cue(2, 'rp3,5'), tItu = cue(2, 'itu', 1), t70 = cue(2, '70%'), tBel2 = cue(2, 'belum', 1);
  const mins = lerp(5, 20, prog(t, tLima, 1.5, easeInOut));
  return (
    <g>
      <Shot t={t} a={c.start - 0.4} b={tLima - 0.1} inn="zoom" out="left">
        <Room t={t} floor={C.pale} />
        <BigClock x={200} y={560} R={560} t={t} h={9} m={5} />
        <PhoneScreen x={1400} y={760} w={640} r={-5}>
          <g transform={`translate(0 ${lerp(-520, -300, pop(t, tNotif, 0.5))})`} opacity={clamp((t - tNotif) * 4)}>
            <rect x={-185} y={-55} width={370} height={110} rx={26} fill={C.ink} />
            <Txt x={0} y={-14} size={24} weight={700} fill={C.light}>BANK · baru saja</Txt>
            <Txt x={0} y={20} size={30} weight={900} fill="#fff">Gaji +Rp5.000.000</Txt>
          </g>
          <Txt x={0} y={-120} size={28} weight={600} fill={C.grey}>Saldo</Txt>
          <Txt x={0} y={-60} size={50} weight={900}>{rupiah(5000000 * prog(t, tNotif + 0.3, 0.8))}</Txt>
        </PhoneScreen>
        <Bills t={t} t0={tNotif + 0.3} n={10} ox={1300} oy={400} mode="burst" w={200} />
      </Shot>
      <Shot t={t} a={tLima - 0.1} b={tLima2 - 0.1} inn="left" out="up" push={0.06}>
        <Room t={t} floor={C.primary} floorY={920} />
        <BigClock x={-120} y={420} R={420} t={t} h={9} m={mins} />
        <Pic n="tower" x={1250} y={lerp(1400, 560, easeOut((t - tLima) / 1.2))} w={520} />
        <Bills t={t} t0={tKos - 0.6} n={12} ox={600} oy={620} mode="stream" dx={1250} w={180} />
        <Tag x={1650} y={430} t={t} t0={tKos - 0.4} top="Bayar kos" amt="−Rp1,5 jt" />
      </Shot>
      <Shot t={t} a={tLima2 - 0.1} b={tJam - 0.1} inn="up" out="zoom" push={0.08}>
        <Room t={t} floor={C.light} />
        <g transform={`translate(1100 600) rotate(${Math.sin(t * 1.5) * 3}) scale(${pop(t, tLima2, 0.6)})`}>
          <Envelope x={0} y={0} w={760} fill={C.mid} />
        </g>
        <Bills t={t} t0={tIbu - 1.6} n={14} ox={-100} oy={500} mode="stream" dx={1100} w={200} />
        <Tag x={480} y={420} t={t} t0={tIbu - 1.0} top="Kirim ke ibu" amt="−Rp750 rb" col={C.primary} />
      </Shot>
      <Shot t={t} a={tJam - 0.1} b={tLalu - 0.1} inn="zoom" out="left" push={0.1}>
        <Room t={t} floor={C.pale} />
        <PhoneScreen x={960} y={820} w={760}>
          <Txt x={0} y={-250} size={30} weight={700} fill={C.grey}>Autodebet</Txt>
          <Txt x={0} y={-190} size={44} weight={900}>Cicilan HP</Txt>
          <Txt x={0} y={-110} size={52} weight={900} fill={C.red}>−Rp650.000</Txt>
          {t > tKep && <Check x={0} y={60} s={pop(t, tKep + 0.6) * 1.2} col={C.red} />}
        </PhoneScreen>
        {(() => {
          const dn = prog(t, tKep - 0.6, 0.6, easeOut), up = prog(t, tKep + 0.5, 0.8, easeIn);
          const hy = lerp(-700, -60, dn) - up * 900;
          return (
            <g>
              <Pic n="hand_pinch" x={1060} y={hy - 300} w={520} />
              <g transform={`translate(1089 ${hy + 66}) scale(${0.4 + 0.6 * Math.abs(Math.cos(t * 3))} 1)`} opacity={dn}>
                <circle r={70} fill="#B9821B" cy={8} /><circle r={70} fill={C.amber} /><Txt x={0} y={3} size={44} weight={900} fill="#7A5208">Rp</Txt>
              </g>
            </g>
          );
        })()}
      </Shot>
      <Shot t={t} a={tLalu - 0.1} b={tDit - 0.1} inn="left" out="zoom" push={0.07}>
        <Room t={t} floor={C.light} />
        <Pic n="bag" x={760} y={lerp(1500, 580, easeOut((t - tLalu) / 0.9))} w={680} r={-4} />
        <g transform={`translate(${lerp(760, 1400, prog(t, tPay - 0.2, 0.8))} ${lerp(500, 420, prog(t, tPay - 0.2, 0.8))}) rotate(${lerp(0, 6, prog(t, tPay, 0.8))})`} opacity={prog(t, tPay - 0.3, 0.3)}>
          <rect x={-240} y={-300} width={480} height={600} fill="#fff" filter="url(#soft)" />
          <rect x={-240} y={-300} width={480} height={90} fill={C.ink} />
          <Txt x={0} y={-254} size={34} weight={900} fill="#fff" ls={4}>PAYLATER</Txt>
          <Txt x={-200} y={-150} size={30} weight={700} anchor="start">Tagihan bulan ini</Txt>
          {[0, 1, 2].map((k) => <rect key={k} x={-200} y={-90 + k * 50} width={300 - k * 60} height={20} rx={10} fill={C.pale} />)}
          <Txt x={0} y={190} size={72} weight={900} fill={C.red}>−Rp480 rb</Txt>
        </g>
      </Shot>
      <Shot t={t} a={tDit - 0.1} b={tBel - 0.1} inn="zoom" out="left" push={0.1}>
        <Room t={t} floor={C.pale} />
        <Wifi x={780} y={760} s={pop(t, tDit, 0.6) * 1.15} t={t} />
        <Tag x={1450} y={460} t={t} t0={tInt} top="Paket internet" amt="−Rp150 rb" />
      </Shot>
      <Shot t={t} a={tBel - 0.1} b={t70 - 0.15} inn="left" out="zoom" push={0.05}>
        <Room t={t} floor={C.light} />
        <BigClock x={180} y={560} R={540} t={t} h={9 + prog(t, tBel, 1.2, easeInOut) * 0 + (prog(t, tBel, 1.2) > 0.99 ? 1 : 0)} m={lerp(50, 60, prog(t, tBel, 1.2, easeInOut)) % 60} />
        {['Kos −1,5 jt', 'Ibu −750 rb', 'Cicilan −650 rb', 'Paylater −480 rb', 'Internet −150 rb'].map((l, i) => {
          const d = t - (tBel + i * 0.18);
          const y = d < 0 ? -200 : Math.min(260 + i * 104, -200 + 0.5 * 4200 * d * d);
          return (
            <g key={l} transform={`translate(1350 ${y}) rotate(${(rnd(i, 1) - 0.5) * 10})`}>
              <rect x={-260} y={-42} width={520} height={84} rx={42} fill={C.red} />
              <Txt x={0} y={3} size={38} weight={900} fill="#fff">{l}</Txt>
            </g>
          );
        })}
        <g transform={`translate(1350 880) scale(${pop(t, t35, 0.6)})`} opacity={clamp((t - t35) * 4)}>
          <rect x={-330} y={-80} width={660} height={160} rx={30} fill={C.ink} />
          <Txt x={0} y={4} size={88} weight={900} fill="#fff" ls={-2}>−Rp3,5 jt</Txt>
        </g>
      </Shot>
      <Shot t={t} a={t70 - 0.15} b={c.end + 0.6} inn="zoom" out="zoom" push={0.12}>
        <Room t={t} floor={C.deep2} floorY={940} dark />
        <Donut x={700} y={560} R={430} th={170} pct={0.7 * prog(t, t70, 1.2, easeInOut)} col={C.mid} bg="#0E2E22" />
        <Extrude x={700} y={560} size={230} text="70%" face="#F4F2EC" side={C.primary} depth={14} s={pop(t, t70 + 0.2)} />
        <g opacity={prog(t, tBel2, 0.3)}>
          <Pic n="bag" x={1500} y={lerp(1300, 620, easeOut((t - tBel2) / 0.8))} w={440} />
          <Cross x={1500} y={620} len={420} s={pop(t, tBel2 + 0.8)} o={clamp((t - tBel2 - 0.8) * 4)} />
        </g>
      </Shot>
    </g>
  );
};

/* ================= BAB 3 ================= */
const MONTHS = ['AGU', 'SEP', 'OKT', 'NOV', 'DES', 'JAN', 'FEB'];
export const Bab3v: React.FC<S> = ({ t }) => {
  const c = chap(3);
  const tPay0 = cue(3, 'paylater', 0), tDua = cue(3, 'dua-duanya'), tHp = cue(3, 'hp-nya'), tKarena = cue(3, 'karena'), tCicil = cue(3, 'dicicil');
  const tJadi = cue(3, 'jadi', 0), tLunas = cue(3, 'lunas'), tPay1 = cue(3, 'paylater', 1), tBayar = cue(3, 'bayarnya'), tArti = cue(3, 'artinya');
  const tMinjem = cue(3, 'minjem'), tDan = cue(3, 'dan', 1), t32 = cue(3, '32'), tJadi2 = cue(3, 'jadi', 1), tPakai = cue(3, 'kepakai');
  return (
    <g>
      <Shot t={t} a={c.start - 0.4} b={tDua - 0.1} inn="zoom" out="zoom">
        <Room t={t} floor={C.light} />
        <PhoneScreen x={600} y={760} w={620} r={-4}>
          <Txt x={0} y={-200} size={34} weight={700} fill={C.grey}>Cicilan HP</Txt>
          <Txt x={0} y={-120} size={64} weight={900} fill={C.red}>Rp650 rb</Txt>
          <Txt x={0} y={-60} size={28} weight={600} fill={C.grey}>tiap bulan</Txt>
        </PhoneScreen>
        <g opacity={prog(t, tPay0 - 0.5, 0.3)}>
          <Pic n="bag" x={1380} y={lerp(1300, 620, easeOut((t - tPay0 + 0.5) / 0.8))} w={560} r={5} />
          <Tag x={1560} y={340} t={t} t0={tPay0} top="Paylater" amt="Rp480 rb" s={0.75} />
        </g>
      </Shot>
      <Shot t={t} a={tDua - 0.1} b={tHp - 0.1} inn="zoom" out="left" push={0.1}>
        <Room t={t} floor={C.pale} />
        <FlipCal x={960} y={560} w={520} f={0} top="HARI INI" label={() => ''} />
        <Bills t={t} t0={tDua} n={8} mode="rain" w={160} />
        <Stamp x={960} y={600} t={t} t0={cue(3, 'bukan')} text="BUKAN BELANJA HARI INI" size={70} />
      </Shot>
      <Shot t={t} a={tHp - 0.1} b={tLunas + 0.7} inn="left" out="up" push={0.04}>
        <Room t={t} floor={C.light} floorY={880} />
        {(() => {
          const pan = lerp(0, -900, prog(t, tJadi, tLunas - tJadi + 0.6, easeInOut));
          return (
            <g transform={`translate(${pan} 0)`}>
              <Pic n="hand_phone" x={380} y={lerp(1400, 640, easeOut((t - tHp) / 0.9))} w={460} r={-6} />
              <path d={`M560 520 H${560 + 2600 * prog(t, tCicil - 0.2, 2.4)}`} stroke={C.ink} strokeWidth={10} strokeDasharray="30 22" strokeDashoffset={-t * 60} />
              {MONTHS.map((m, i) => {
                const x = 800 + i * 380;
                const tb = i === 0 ? 1e9 : lerp(tJadi + 0.4, tLunas - 0.3, (i - 1) / 5);
                const bite = prog(t, tb, 0.35);
                return (
                  <g key={m}>
                    <g transform={`translate(${x} 640) scale(${pop(t, tKarena + i * 0.12)})`}>
                      <rect x={-150} y={-110} width={300} height={220} rx={24} fill={i === 3 ? C.primary : C.mid} filter="url(#soft)" />
                      <path d="M-140 -100 L0 10 L140 -100" fill="none" stroke="#fff" strokeWidth={8} strokeOpacity={0.8} />
                      <Txt x={0} y={160} size={44} weight={900}>{m}</Txt>
                      {bite > 0 && <circle cx={150} cy={-110} r={90 * bite} fill={C.paper} />}
                    </g>
                    {bite > 0 && <g transform={`translate(${x} ${450 - bite * 60})`} opacity={bite}><Txt x={0} y={0} size={44} weight={900} fill={C.red}>−650rb</Txt></g>}
                  </g>
                );
              })}
              <Stamp x={800 + 6 * 380} y={640} t={t} t0={tLunas} text="LUNAS" col={C.primary} size={70} />
            </g>
          );
        })()}
      </Shot>
      <Shot t={t} a={tLunas + 0.7} b={tArti - 0.1} inn="up" out="zoom" push={0.06}>
        <Room t={t} floor={C.pale} />
        <Pic n="bag" x={560} y={620} w={560} r={-3} />
        <g transform={`translate(1380 560) scale(${pop(t, tBayar - 0.4)})`}>
          <rect x={-300} y={-200} width={600} height={400} rx={30} fill="none" stroke={C.ink} strokeWidth={8} strokeDasharray="30 20" strokeDashoffset={-t * 40} />
          <Txt x={0} y={-40} size={46} weight={900}>Gaji bulan depan</Txt>
          <Txt x={0} y={30} size={36} weight={400} italic>belum masuk</Txt>
        </g>
        <Bills t={t} t0={tBayar} n={10} ox={1380} oy={560} mode="stream" dx={560} w={170} />
      </Shot>
      <Shot t={t} a={tArti - 0.1} b={tDan - 0.1} inn="zoom" out="left" push={0.08}>
        <Room t={t} floor={C.light} />
        <BigClock x={1500} y={560} R={420} t={t * -6} h={(t * 3) % 12} m={(t * 36) % 60} />
        <Pic n="wallet" x={560} y={640} w={720} />
        <path d="M1150 420 C900 200 700 260 600 460" stroke={C.primary} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={`${1000 * prog(t, tMinjem, 0.8)} 1000`} />
        <Bills t={t} t0={tMinjem + 0.3} n={10} ox={1300} oy={420} mode="stream" dx={560} w={170} />
        <g opacity={prog(t, tMinjem, 0.3)} transform={`translate(900 220) scale(${pop(t, tMinjem)})`}>
          <rect x={-260} y={-50} width={520} height={100} rx={50} fill={C.primary} />
          <Txt x={0} y={3} size={40} weight={900} fill="#fff">minjem dari masa depan</Txt>
        </g>
      </Shot>
      <Shot t={t} a={tDan - 0.1} b={tJadi2 - 0.1} inn="left" out="zoom" push={0.05}>
        <Room t={t} floor={C.pale} />
        {Array.from({ length: 48 }).map((_, i) => {
          const col = i % 12, row = Math.floor(i / 12);
          const x = 140 + col * 150 + (row % 2) * 40, y = 230 + row * 170;
          const s = pop(t, tDan + 0.3 + (col + row) * 0.06, 0.4);
          return <g key={i} transform={`translate(${x} ${y}) scale(${s * 0.42}) rotate(${Math.sin(t * 2 + i) * 4})`}><CardIcon x={0} y={0} col={i % 3 ? C.primary : C.mid} /></g>;
        })}
        <g transform={`translate(960 560) scale(${pop(t, t32, 0.6)})`} opacity={clamp((t - t32) * 4)}>
          <rect x={-560} y={-170} width={1120} height={340} rx={40} fill={C.paper} filter="url(#soft)" />
          <Extrude x={0} y={-30} size={170} text="32 juta+" face={C.ink} side={C.primary} depth={12} />
          <Txt x={0} y={110} size={38} weight={400} italic>rekening paylater di bank · OJK, Juni 2026</Txt>
        </g>
      </Shot>
      <Shot t={t} a={tJadi2 - 0.1} b={c.end + 0.6} inn="zoom" out="zoom" push={0.1}>
        <Room t={t} floor={C.deep2} floorY={940} dark />
        <Extrude x={620} y={520} size={640} text="?" face={C.light} side={C.primary} depth={24} r={Math.sin(t * 1.4) * 8} s={pop(t, tJadi2, 0.7)} />
        <g transform={`translate(1360 ${lerp(-400, 560, easeOut((t - tPakai + 0.8) / 0.8))})`}>
          <Envelope x={0} y={0} w={520} fill={C.light} />
        </g>
        <Stamp x={1360} y={560} t={t} t0={tPakai + 0.2} text="UDAH KEPAKAI" size={56} />
      </Shot>
    </g>
  );
};

/* ================= BAB 4 ================= */
export const Bab4v: React.FC<S> = ({ t }) => {
  const c = chap(4);
  const tSis = cue(4, 'sisanya'), tKen = cue(4, 'kenyataannya'), t66 = cue(4, 'rp66'), tIni = cue(4, 'ini'), tBesar = cue(4, 'besar');
  const tBuat = cue(4, 'buat', 1), t2001 = cue(4, '2001'), tEks = cue(4, 'eksperimen'), tMit = cue(4, 'mit');
  const lvl = lerp(1, 0.045, prog(t, tKen, t66 - tKen, easeInOut));
  return (
    <g>
      <Shot t={t} a={c.start - 0.4} b={tSis - 0.1} inn="zoom" out="left" push={0.1}>
        <Room t={t} floor={C.light} />
        <Donut x={960} y={560} R={420} th={160} pct={0.7} col={C.red} bg={C.pale} />
        <Extrude x={960} y={560} size={220} text="70%" face={C.ink} side={C.red} depth={14} s={pop(t, c.start)} />
      </Shot>
      <Shot t={t} a={tSis - 0.1} b={tIni - 0.1} inn="left" out="zoom" push={0.06}>
        <Room t={t} floor={C.pale} />
        <g transform="translate(640 600) scale(2.1)"><Jar x={0} y={0} level={lvl} /></g>
        {t > tKen && t < t66 + 0.6 && Array.from({ length: 7 }).map((_, i) => {
          const ph = ((t - tKen) * 1.3 + i / 7) % 1;
          return <Pic key={i} n="bill" x={640 + (i - 3) * 40 + Math.sin(ph * 6 + i) * 30} y={940 + ph * 260} w={150} r={ph * 200} sy={0.5 + 0.5 * Math.cos(ph * 9)} shadow={false} o={1 - ph} />;
        })}
        <g transform={`translate(640 ${1000})`}><Txt x={0} y={0} size={70} weight={900} fill={t > t66 ? C.red : C.ink}>{t > t66 ? 'Rp66 rb' : rupiah(1470000 * lvl)}</Txt></g>
        <FlipCal x={1400} y={540} w={480} f={clamp((t - tKen) / (t66 - tKen)) * 9} hl={C.primary} />
      </Shot>
      <Shot t={t} a={tIni - 0.1} b={tBuat - 0.1} inn="zoom" out="up" push={0.08}>
        <Room t={t} floor={C.light} />
        {Array.from({ length: 22 }).map((_, i) => {
          const d = t - tIni - rnd(i, 1) * 1.5;
          if (d < 0) return null;
          const x = 120 + rnd(i, 2) * 900, y = Math.min(820 + rnd(i, 3) * 60, -100 + 0.5 * 2400 * d * d);
          return <g key={i} transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * Math.abs(Math.cos(t * 4 + i))} 1)`}><circle r={46} fill="#B9821B" cy={6} /><circle r={46} fill={C.amber} /><Txt x={0} y={2} size={28} weight={900} fill="#7A5208">Rp</Txt></g>;
        })}
        <Pic n="bag" x={1400} y={600} w={560} />
        <Cross x={1400} y={600} len={560} s={pop(t, tBesar)} o={clamp((t - tBesar) * 4)} />
      </Shot>
      <Shot t={t} a={tBuat - 0.1} b={c.end + 0.6} inn="up" out="zoom" push={0.1}>
        <Room t={t} floor={C.deep2} floorY={940} dark />
        <BigClock x={1580} y={560} R={460} t={-t * 8} h={12 - ((t - tBuat) * 6) % 12} m={60 - ((t - tBuat) * 360) % 60} />
        <Extrude x={640} y={480} size={300} text={`${Math.round(lerp(2026, 2001, prog(t, tBuat + 1.2, t2001 - tBuat - 0.8, easeInOut)))}`} face="#F4F2EC" side={C.primary} depth={18} />
        <g opacity={prog(t, tEks, 0.3)} transform={`translate(720 800) scale(${pop(t, tEks)})`}>
          <rect x={-300} y={-70} width={600} height={140} rx={70} fill="#F4F2EC" />
          <Txt x={0} y={4} size={58} weight={900} fill={C.deep}>{t > tMit ? 'Eksperimen MIT' : 'Eksperimen'}</Txt>
        </g>
      </Shot>
    </g>
  );
};

/* ================= BAB 5 ================= */
export const Bab5v: React.FC<S> = ({ t }) => {
  const c = chap(5);
  const tDrazen = cue(5, 'drazen'), tDuncan = cue(5, 'duncan'), tLel = cue(5, 'melelang'), tSep = cue(5, 'separuh'), tTun = cue(5, 'tunai', 0);
  const tSepN = cue(5, 'separuhnya'), tTik = cue(5, 'tiketnya'), tHas = cue(5, 'hasilnya'), t29 = cue(5, '29'), t61 = cue(5, '61'), tLeb = cue(5, 'lebih');
  const tPen = cue(5, 'penelitian'), tQris = cue(5, 'qris'), tEw = cue(5, 'e-wallet'), tTapi = cue(5, 'tapi'), tDom = cue(5, 'dompet');
  const prof = (x: number, t0: number, name: string) => (
    <g transform={`translate(${x} 560) scale(${pop(t, t0, 0.6)})`}>
      <circle r={220} fill={C.primary} /><circle r={220} fill="url(#gloss)" />
      <Person x={0} y={30} s={3.6} col="#F4F2EC" />
      <rect x={-260} y={250} width={520} height={90} rx={45} fill="#F4F2EC" />
      <Txt x={0} y={297} size={42} weight={900} fill={C.deep}>{name}</Txt>
    </g>
  );
  return (
    <g>
      <Shot t={t} a={c.start - 0.4} b={tLel - 0.1} inn="zoom" out="zoom">
        <Room t={t} floor={C.deep2} floorY={980} dark />
        {prof(600, tDrazen - 0.2, 'Drazen Prelec')}
        {prof(1320, tDuncan - 0.2, 'Duncan Simester')}
      </Shot>
      <Shot t={t} a={tLel - 0.1} b={tSep - 0.1} inn="zoom" out="left" push={0.12}>
        <Room t={t} floor={C.deep2} floorY={980} dark />
        <g transform={`translate(960 560) rotate(${Math.sin(t * 1.6) * 8}) scale(${pop(t, tLel, 0.6) * 2.4})`}><Ticket x={0} y={0} /></g>
      </Shot>
      <Shot t={t} a={tSep - 0.1} b={tTik - 0.1} inn="left" out="zoom" push={0.05}>
        <Room t={t} floor={C.light} />
        <rect x={955} y={-200} width={10} height={1400} fill={C.ink} opacity={0.2} />
        <g opacity={prog(t, tTun - 0.6, 0.3)}>
          <Pic n="hand_cash" x={lerp(-300, 470, easeOut((t - tTun + 0.6) / 0.8))} y={560} w={760} r={-6} />
          <Txt x={470} y={920} size={64} weight={900}>TUNAI</Txt>
        </g>
        <g opacity={prog(t, tSepN, 0.3)}>
          <g transform={`translate(${lerp(2300, 1440, easeOut((t - tSepN) / 0.8))} 540) rotate(${8 + Math.sin(t * 1.5) * 4}) scale(1.7)`}><CardIcon x={0} y={0} col={C.amber} /></g>
          <Txt x={1440} y={920} size={64} weight={900}>KARTU KREDIT</Txt>
        </g>
      </Shot>
      <Shot t={t} a={tTik - 0.1} b={tHas - 0.1} inn="zoom" out="up" push={0.1}>
        <Room t={t} floor={C.pale} />
        <g transform={`translate(520 560) scale(${pop(t, tTik) * 1.6}) rotate(-6)`}><Ticket x={0} y={0} /></g>
        <Txt x={960} y={570} size={200} weight={900}>=</Txt>
        <g transform={`translate(1400 560) scale(${pop(t, tTik + 0.2) * 1.6}) rotate(6)`}><Ticket x={0} y={0} /></g>
      </Shot>
      <Shot t={t} a={tHas - 0.1} b={tPen - 0.1} inn="up" out="zoom" push={0.06}>
        <Room t={t} floor={C.ink} floorY={940} />
        {[{ x: 620, v: 29, tt: t29, col: C.mid, img: 'hand_cash' }, { x: 1300, v: 61, tt: t61, col: C.amber, img: '' }].map((b) => {
          const h = b.v * 11.5 * prog(t, b.tt - 0.3, 0.9, easeOut);
          return (
            <g key={b.x}>
              <rect x={b.x - 190} y={940 - h} width={380} height={h} rx={18} fill={b.col} />
              <rect x={b.x - 190} y={940 - h} width={60} height={h} fill="#fff" opacity={0.15} />
              {h > 10 && <Extrude x={b.x} y={940 - h - 110} size={140} text={`$${Math.round(b.v * clamp((h) / (b.v * 11.5)))}`} face={C.ink} side={b.col} depth={10} />}
            </g>
          );
        })}
        <Txt x={620} y={1000} size={44} weight={900} fill="#fff">tunai</Txt>
        <Txt x={1300} y={1000} size={44} weight={900} fill="#fff">kartu</Txt>
        <g transform={`translate(1650 300) scale(${pop(t, tLeb)}) rotate(${Math.sin(t * 2) * 5})`} opacity={clamp((t - tLeb) * 4)}>
          <circle r={150} fill={C.red} /><Txt x={0} y={-10} size={110} weight={900} fill="#fff">2×</Txt><Txt x={0} y={70} size={34} weight={800} fill="#fff">lipat</Txt>
        </g>
      </Shot>
      <Shot t={t} a={tPen - 0.1} b={tTapi - 0.1} inn="zoom" out="left" push={0.07}>
        <Room t={t} floor={C.light} />
        <g transform={`translate(420 560) scale(${pop(t, tPen) * 1.3}) rotate(-8)`}><CardIcon x={0} y={0} col={C.amber} /></g>
        <Txt x={760} y={570} size={150} weight={900} opacity={prog(t, tQris, 0.3)}>≈</Txt>
        <PhoneScreen x={1300} y={lerp(1600, 780, easeOut((t - tQris + 0.3) / 0.8))} w={640}>
          <g transform="translate(0 -120) scale(1.3)"><QR x={0} y={0} /></g>
          <Txt x={0} y={120} size={40} weight={900} fill={C.primary} opacity={prog(t, tEw, 0.3)}>e-wallet</Txt>
        </PhoneScreen>
      </Shot>
      <Shot t={t} a={tTapi - 0.1} b={c.end + 0.6} inn="left" out="zoom" push={0.12}>
        <Room t={t} floor={C.pale} />
        <Pic n="wallet" x={960} y={600} w={1200} r={lerp(6, 0, prog(t, tTapi, 1))} />
        <Bills t={t} t0={tDom} n={10} ox={960} oy={460} mode="burst" w={200} />
      </Shot>
    </g>
  );
};

/* ================= BAB 6 ================= */
export const Bab6v: React.FC<S> = ({ t }) => {
  const c = chap(6);
  const tPen = cue(6, 'peneliti'), tPain = cue(6, 'pain'), tKalau = cue(6, 'kalau', 0), tPin = cue(6, 'pindah'), tKalau2 = cue(6, 'kalau', 1);
  const tScan = cue(6, 'scan'), tTring = cue(6, 'tring'), tSel = cue(6, 'selesai'), tNg = cue(6, 'nggak', 1), tRem = cue(6, 'ngerem'), tDan = cue(6, 'dan');
  const needle = (() => {
    let v = lerp(0.5, 0.15, prog(t, c.start, 1.2, easeInOut));
    v = lerp(v, 0.92, prog(t, tPin - 0.4, 0.8, easeInOut));
    v = lerp(v, 0.25, prog(t, tScan, 0.8, easeInOut));
    v = lerp(v, 0.03, prog(t, tSel, 0.8, easeInOut));
    return v + Math.sin(t * 9) * 0.01;
  })();
  return (
    <g>
      <Shot t={t} a={c.start - 0.4} b={tPen - 0.1} inn="zoom" out="zoom" push={0.06}>
        <Room t={t} floor={C.pale} floorY={1000} />
        <Gauge x={960} y={1000} R={720} v={needle} />
        <Pic n="bag" x={960} y={lerp(-400, 480, easeOut((t - cue(6, 'gampang')) / 0.8))} w={300} />
      </Shot>
      <Shot t={t} a={tPen - 0.1} b={tKalau - 0.1} inn="zoom" out="left" push={0.1}>
        <Extrude x={960} y={470} size={190} text="pain of paying" face="#F4F2EC" side={C.primary} depth={14} s={pop(t, tPain, 0.6)} />
        <g opacity={prog(t, cue(6, 'rasa'), 0.4)}><Txt x={960} y={700} size={56} italic weight={400} fill={C.light}>rasa sakit waktu bayar</Txt></g>
      </Shot>
      <Shot t={t} a={tKalau - 0.1} b={tKalau2 - 0.1} inn="left" out="up" push={0.05}>
        <Room t={t} floor={C.light} />
        <Pic n="hand_cash" x={lerp(-200, 560, easeOut((t - tKalau) / 0.8))} y={500} w={820} r={-4} />
        <Bills t={t} t0={tPin - 0.5} n={8} ox={500} oy={440} mode="stream" dx={1500} w={200} />
        <Gauge x={1450} y={900} R={330} v={needle} />
      </Shot>
      <Shot t={t} a={tKalau2 - 0.1} b={tNg - 0.1} inn="up" out="zoom" push={0.06}>
        <Room t={t} floor={C.pale} />
        <PhoneScreen x={760} y={800} w={720}>
          <g transform="translate(0 -100) scale(1.4)"><QR x={0} y={0} /></g>
          <rect x={-170} y={lerp(-290, 80, ((t - tScan) * 1.4) % 1)} width={340} height={10} rx={5} fill={C.red} opacity={t > tScan && t < tTring ? 1 : 0} />
          {t > tSel && <g transform="translate(0 -100)"><Check x={0} y={0} s={pop(t, tSel) * 2} /></g>}
        </PhoneScreen>
        {[0, 1, 2].map((i) => {
          const ph = clamp((t - tTring - i * 0.18) / 0.9);
          return ph > 0 && ph < 1 ? <circle key={i} cx={760} cy={600} r={200 + ph * 500} fill="none" stroke={C.mid} strokeWidth={14} opacity={1 - ph} /> : null;
        })}
        <Gauge x={1480} y={900} R={330} v={needle} />
      </Shot>
      <Shot t={t} a={tNg - 0.1} b={tDan - 0.1} inn="zoom" out="up" push={0.08}>
        <Room t={t} floor={C.pale} floorY={1000} />
        <Gauge x={960} y={1000} R={720} v={needle} />
        <Stamp x={960} y={420} t={t} t0={tRem - 0.3} text="NGGAK ADA REM" size={80} />
      </Shot>
      <Shot t={t} a={tDan - 0.1} b={c.end + 0.6} inn="up" out="down" push={0.04}>
        <Room t={t} floor={C.light} floorY={980} />
        <rect x={460} y={140} width={1000} height={170} rx={40} fill={C.ink} filter="url(#soft)" />
        <rect x={560} y={250} width={800} height={24} rx={12} fill="#000" />
        <g transform={`translate(960 ${262 + lerp(-700, 0, prog(t, cue(6, 'catat') - 1, 3, easeInOut))})`}>
          <rect x={-340} y={0} width={680} height={700} fill="#fff" />
          {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-280} y={60 + i * 100} width={420 - (i % 3) * 90} height={26} rx={13} fill={C.light} />)}
        </g>
        <rect x={460} y={140} width={1000} height={120} rx={40} fill={C.ink} />
      </Shot>
    </g>
  );
};

/* ================= BAB 7 ================= */
const ITEMS = [
  { k: 'makan', l: 'Makan', calc: 'Rp60 rb × 9 hari', v: 540 },
  { k: 'kopi', l: 'Kopi & jajan', calc: 'Rp35 rb × 9 hari', v: 315 },
  { k: 'nongkrong', l: 'Nongkrong', calc: 'akhir pekan', v: 250 },
  { k: 'checkout', l: 'Flash sale', calc: 'tengah malam', v: 199 },
  { k: 'bensin', l: 'Bensin & ojek', calc: '9 hari', v: 100 },
];
const Plate: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={30} rx={260} ry={80} fill="#000" opacity={0.12} />
    <circle r={250} fill="#fff" filter="url(#soft)" /><circle r={180} fill="#F1EFE8" />
    <circle cx={-40} cy={-20} r={90} fill="#F7F3E6" /><circle cx={70} cy={40} r={60} fill={C.amber} /><path d="M-100 80 q60 -60 140 -20" stroke={C.primary} strokeWidth={30} fill="none" strokeLinecap="round" />
  </g>
);
const Fuel: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-230} width={300} height={460} rx={40} fill={C.red} filter="url(#soft)" />
    <rect x={-100} y={-180} width={200} height={140} rx={20} fill="#F4F2EC" />
    <Txt x={0} y={-110} size={70} weight={900}>9 hr</Txt>
    <path d="M150 -100 h50 v200 a30 30 0 0 1 -60 0" stroke={C.ink} strokeWidth={22} fill="none" />
  </g>
);
export const Bab7v: React.FC<S> = ({ t }) => {
  const c = chap(7);
  const ts = ITEMS.map((i) => cue(7, i.k));
  const tTot = cue(7, 'totalnya'), tSisa = cue(7, 'sisa'), tNg = cue(7, 'nggak', 0), tMalah = cue(7, 'malah');
  const cur = ts.filter((x) => t >= x - 0.3).length - 1;
  return (
    <g>
      <Shot t={t} a={c.start - 0.4} b={tTot - 0.1} inn="down" out="left" push={0.03}>
        <Room t={t} floor={C.light} floorY={960} />
        {(() => {
          const scroll = lerp(0, -420, prog(t, ts[2], ts[4] - ts[2] + 0.6, easeInOut));
          return (
            <g transform={`translate(560 ${330 + scroll})`}>
              <rect x={-360} y={-200} width={720} height={1600} fill="#fff" filter="url(#soft)" />
              <Txt x={0} y={-130} size={40} weight={900} ls={6}>STRUK 9 HARI</Txt>
              <line x1={-300} y1={-80} x2={300} y2={-80} stroke={C.ink} strokeWidth={4} strokeDasharray="10 10" />
              {ITEMS.map((it, i) => {
                const o = prog(t, ts[i] - 0.2, 0.4);
                return (
                  <g key={i} opacity={o} transform={`translate(${(1 - o) * -60} ${i * 200})`}>
                    <Txt x={-300} y={20} size={50} weight={900} anchor="start">{it.l}</Txt>
                    <Txt x={-300} y={80} size={32} weight={400} italic anchor="start" opacity={0.7}>{it.calc}</Txt>
                    <Txt x={300} y={20} size={52} weight={900} anchor="end">{`Rp${it.v} rb`}</Txt>
                  </g>
                );
              })}
            </g>
          );
        })()}
        {ITEMS.map((it, i) => {
          const vis = i === cur;
          const k = vis ? pop(t, ts[i] - 0.1, 0.6) : 0;
          if (!vis) return null;
          const x = 1420, y = 560;
          return (
            <g key={i} transform={`translate(0 ${Math.sin(t * 2) * 10})`}>
              {i === 0 && <Plate x={x} y={y} s={k * 1.3} />}
              {i === 1 && <Pic n="cup" x={x} y={y} w={460 * k} r={Math.sin(t * 1.5) * 4} />}
              {i === 2 && <g><Pic n="cup" x={x - 170} y={y + 40} w={330 * k} r={-8} /><Pic n="cup" x={x + 170} y={y + 40} w={330 * k} r={8} /></g>}
              {i === 3 && <g><Pic n="bag" x={x} y={y} w={600 * k} /><Stamp x={x} y={y - 330} t={t} t0={ts[3] + 0.4} text="00:00" size={60} col={C.ink} r={6} /></g>}
              {i === 4 && <Fuel x={x} y={y} s={k * 1.1} />}
            </g>
          );
        })}
      </Shot>
      <Shot t={t} a={tTot - 0.1} b={tNg - 0.1} inn="left" out="zoom" push={0.08}>
        <Room t={t} floor={C.pale} />
        <Bills t={t} t0={tTot} n={14} mode="rain" w={200} />
        <BigNum x={960} y={420} text="−Rp1.404.000" t={t} t0={tTot + 0.3} size={170} />
        <g opacity={prog(t, tSisa, 0.3)} transform={`translate(960 760) scale(${pop(t, tSisa)})`}>
          <rect x={-420} y={-110} width={840} height={220} rx={50} fill={C.red} />
          <Txt x={0} y={-30} size={40} weight={700} fill="#fff">sisa saldo</Txt>
          <Txt x={0} y={40} size={100} weight={900} fill="#fff">Rp66.000</Txt>
        </g>
      </Shot>
      <Shot t={t} a={tNg - 0.1} b={c.end + 0.6} inn="zoom" out="zoom" push={0.06}>
        <Room t={t} floor={C.light} floorY={960} />
        {(() => {
          const tilt = lerp(0, 10, prog(t, tMalah + 0.6, 1.2, easeInOut)) + Math.sin(t * 2) * 0.8;
          const L = 560;
          const lx = -Math.cos((tilt * Math.PI) / 180) * L, ly = -Math.sin((tilt * Math.PI) / 180) * L;
          return (
            <g transform="translate(960 300)">
              <rect x={-18} y={0} width={36} height={640} fill={C.ink} />
              <rect x={-160} y={630} width={320} height={40} rx={20} fill={C.ink} />
              <g transform={`rotate(${tilt})`}>
                <rect x={-L} y={-10} width={L * 2} height={20} rx={10} fill={C.ink} />
              </g>
              <circle r={26} fill={C.primary} />
              {[{ x: lx, y: ly, n: 'cup', lab: 'Kopi & jajan Rp315 rb' }, { x: -lx, y: -ly, n: 'bag', lab: 'Flash sale Rp199 rb' }].map((p) => (
                <g key={p.n} transform={`translate(${p.x} ${p.y})`}>
                  <line x1={-120} y1={0} x2={0} y2={-0} stroke={C.ink} strokeWidth={4} />
                  <path d="M-170 0 L0 -0 L170 0" stroke={C.ink} strokeWidth={4} fill="none" />
                  <line x1={0} y1={0} x2={-170} y2={260} stroke={C.ink} strokeWidth={4} /><line x1={0} y1={0} x2={170} y2={260} stroke={C.ink} strokeWidth={4} />
                  <path d="M-200 260 H200 Q190 320 0 320 Q-190 320 -200 260 Z" fill={C.primary} />
                  <Pic n={p.n} x={0} y={150} w={p.n === 'cup' ? 190 : 270} />
                  <g transform="translate(0 400)"><rect x={-240} y={-38} width={480} height={76} rx={38} fill={p.n === 'cup' ? C.red : C.ink} /><Txt x={0} y={3} size={32} weight={900} fill="#fff">{p.lab}</Txt></g>
                </g>
              ))}
            </g>
          );
        })()}
      </Shot>
    </g>
  );
};

/* ================= BAB 8 ================= */
export const Bab8v: React.FC<S> = ({ t }) => {
  const c = chap(8);
  const tStop = cue(8, 'stop'), tJujur = cue(8, 'jujur'), tIngat = cue(8, 'ingat'), tKos = cue(8, 'kos'), tTua = cue(8, 'tua'), tCic = cue(8, 'cicilan');
  const tDengan = cue(8, 'dengan'), tPas = cue(8, 'pas-pasan'), tJadi = cue(8, 'jadi'), tPer = cue(8, 'pertama'), tKed = cue(8, 'kedua'), tKabar = cue(8, 'kabar'), tGaj = cue(8, 'gajian');
  return (
    <g>
      <Shot t={t} a={c.start - 0.4} b={tIngat - 0.1} inn="zoom" out="left" push={0.08}>
        <Room t={t} floor={C.light} />
        <Pic n="cup" x={600} y={600} w={520} r={Math.sin(t * 1.4) * 4} />
        <g transform={`translate(1350 400) scale(${pop(t, tStop)})`} opacity={clamp((t - tStop) * 4)}>
          <rect x={-420} y={-130} width={840} height={260} rx={60} fill="#fff" filter="url(#soft)" />
          <path d="M-300 120 L-360 220 L-200 130 Z" fill="#fff" />
          <Txt x={0} y={-30} size={56} weight={900}>“Stop ngopi,</Txt>
          <Txt x={0} y={45} size={56} weight={900}>nanti kaya”</Txt>
        </g>
        <Cross x={1350} y={400} len={640} s={pop(t, tJujur)} o={clamp((t - tJujur) * 4)} />
      </Shot>
      <Shot t={t} a={tIngat - 0.1} b={tDengan - 0.1} inn="left" out="zoom" push={0.06}>
        <Room t={t} floor={C.pale} />
        <Donut x={560} y={560} R={380} th={150} pct={0.7 * prog(t, tIngat, 1.2, easeInOut)} col={C.primary} bg={C.amber} />
        <Extrude x={560} y={560} size={190} text="70%" face={C.ink} side={C.primary} depth={12} />
        <Pic n="tower" x={1200} y={lerp(1500, 600, easeOut((t - tKos + 0.2) / 0.8))} w={280} />
        <g transform={`translate(1480 ${lerp(-400, 560, easeOut((t - tTua) / 0.8))})`}><Envelope x={0} y={0} w={260} fill={C.mid} label="Ortu" /></g>
        <Pic n="hand_phone" x={1760} y={lerp(1500, 680, easeOut((t - tCic) / 0.8))} w={300} r={6} />
      </Shot>
      <Shot t={t} a={tDengan - 0.1} b={tJadi - 0.1} inn="zoom" out="up" push={0.08}>
        <Room t={t} floor={C.light} />
        <g transform="translate(560 600) scale(1.9)"><Jar x={0} y={0} level={0.3} /></g>
        <BigNum x={1300} y={420} text="Rp1,47 jt" t={t} t0={cue(8, 'sisa') - 0.2} size={150} />
        <BigNum x={1300} y={640} text="÷ 30 hari" t={t} t0={cue(8, 'sebulan') - 0.2} size={120} face={C.primary} side={C.deep} />
        <Stamp x={1300} y={860} t={t} t0={tPas} text="PAS-PASAN" size={70} />
      </Shot>
      <Shot t={t} a={tJadi - 0.1} b={tKabar - 0.1} inn="up" out="zoom" push={0.04}>
        <Room t={t} floor={C.pale} />
        {[{ x: 520, tt: tPer, n: '1', h: 'Udah ada tujuannya', s: 'kebutuhan wajib & utang', col: C.primary },
          { x: 1400, tt: tKed, n: '2', h: 'Sisanya bocor', s: 'nggak dibagi + bayar nggak kerasa', col: C.red }].map((k) => (
          <g key={k.n} transform={`translate(${k.x} ${lerp(1400, 560, easeOut((t - k.tt) / 0.8))}) rotate(${(k.n === '1' ? -3 : 3) + Math.sin(t * 1.2) * 1.5})`}>
            <rect x={-380} y={-300} width={760} height={600} rx={44} fill="#fff" filter="url(#soft)" />
            <circle cx={0} cy={-160} r={90} fill={k.col} /><Txt x={0} y={-155} size={100} weight={900} fill="#fff">{k.n}</Txt>
            <Txt x={0} y={20} size={58} weight={900}>{k.h}</Txt>
            <Txt x={0} y={100} size={34} weight={400} italic>{k.s}</Txt>
            {k.n === '2' && t > k.tt && Array.from({ length: 5 }).map((_, i) => {
              const ph = ((t - k.tt) * 1.2 + i / 5) % 1;
              return <ellipse key={i} cx={(i - 2) * 50} cy={180 + ph * 160} rx={12} ry={18} fill={C.mid} opacity={1 - ph} />;
            })}
          </g>
        ))}
        <g opacity={prog(t, tJadi, 0.3) * (1 - prog(t, tPer, 0.3))}><BigNum x={960} y={540} text="2 jawaban" t={t} t0={tJadi} size={200} /></g>
      </Shot>
      <Shot t={t} a={tKabar - 0.1} b={c.end + 0.6} inn="zoom" out="zoom" push={0.1}>
        <Room t={t} floor={C.deep2} floorY={960} dark />
        <FlipCal x={960} y={540} w={520} f={0} top="GAJIAN" />
        <Bills t={t} t0={tGaj - 0.3} n={16} ox={960} oy={420} mode="burst" w={220} />
      </Shot>
    </g>
  );
};

/* ================= BAB 9 ================= */
export const Bab9v: React.FC<S> = ({ t }) => {
  const c = chap(9);
  const tWajib = cue(9, 'wajib'), tPind = cue(9, 'pindahin'), tTab = cue(9, 'tabungan'), tSis = cue(9, 'sisanya', 1), tEw = cue(9, 'e-wallet');
  const tTerus = cue(9, 'terus', 0), tMing = cue(9, 'minggu'), t300 = cue(9, 'rp300'), tJadi = cue(9, 'jadi'), tRabu = cue(9, 'rabu'), tRem = cue(9, 'ngerem');
  const tTerus2 = cue(9, 'terus', 1), tLun = cue(9, 'lunasi'), tNam = cue(9, 'nambah'), tTgl = cue(9, 'tanggal', 1), tTapi = cue(9, 'tapi'), tSek = cue(9, 'sekarang', 1), tKom = cue(9, 'komentar');
  const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const typed = 'Gaji aku habis tanggal ';
  const nType = Math.floor(clamp((t - tSek - 0.6) / 1.8) * typed.length);
  return (
    <g>
      <Shot t={t} a={c.start - 0.4} b={tPind - 0.1} inn="zoom" out="left" push={0.06}>
        <Room t={t} floor={C.light} />
        {Array.from({ length: 10 }).map((_, i) => {
          const wajib = i < 7;
          const go = wajib ? prog(t, tWajib + i * 0.07, 0.7, easeIn) : 0;
          return <Pic key={i} n="bill" x={960 - go * 1600} y={820 - i * 46 - go * 200} w={620} r={(rnd(i, 1) - 0.5) * 8 - go * 20} sy={0.5} />;
        })}
        <Tag x={1550} y={380} t={t} t0={tWajib + 0.2} top="Tagihan wajib" amt="−Rp3,53 jt" col={C.ink} s={0.85} />
      </Shot>
      <Shot t={t} a={tPind - 0.1} b={tSis - 0.1} inn="left" out="zoom" push={0.08}>
        <Room t={t} floor={C.pale} />
        <g transform="translate(960 600) scale(2.1)"><Jar x={0} y={0} level={prog(t, tPind + 0.4, 2.2, easeInOut) * 0.6} /></g>
        {Array.from({ length: 8 }).map((_, i) => {
          const d = t - tPind - 0.3 - i * 0.22;
          if (d < 0 || d > 1) return null;
          return <g key={i} transform={`translate(${960 + (rnd(i, 1) - 0.5) * 120} ${-100 + 0.5 * 2400 * d * d}) scale(${0.4 + 0.6 * Math.abs(Math.cos(d * 10))} 1)`}><circle r={46} fill={C.amber} /><Txt x={0} y={2} size={28} weight={900} fill="#7A5208">Rp</Txt></g>;
        })}
        <g opacity={prog(t, tTab, 0.3)} transform={`translate(1500 380) scale(${pop(t, tTab)})`}>
          <rect x={-260} y={-90} width={520} height={180} rx={40} fill={C.primary} />
          <Txt x={0} y={-25} size={40} weight={700} fill="#fff">Tabungan</Txt><Txt x={0} y={40} size={64} weight={900} fill="#fff">Rp250 rb</Txt>
        </g>
      </Shot>
      <Shot t={t} a={tSis - 0.1} b={tTerus - 0.1} inn="zoom" out="up" push={0.06}>
        <Room t={t} floor={C.light} />
        <PhoneScreen x={960} y={lerp(1500, 800, easeOut((t - tSis) / 0.9))} w={780}>
          <Txt x={0} y={-260} size={36} weight={700} fill={C.grey}>E-wallet (terpisah)</Txt>
          <Txt x={0} y={-170} size={56} weight={900} fill={C.primary}>Rp1.200.000</Txt>
        </PhoneScreen>
        <Bills t={t} t0={tEw - 0.4} n={8} ox={-200} oy={300} mode="stream" dx={960} w={180} />
      </Shot>
      <Shot t={t} a={tTerus - 0.1} b={tJadi - 0.1} inn="up" out="left" push={0.05}>
        <Room t={t} floor={C.pale} />
        {[0, 1, 2, 3].map((i) => {
          const d = prog(t, tMing - 0.4 + i * 0.25, 0.7, easeOut);
          return (
            <g key={i} transform={`translate(${lerp(960, 330 + i * 420, d)} ${lerp(1300, 560, d)}) rotate(${lerp(30, (i - 1.5) * 4, d)})`}>
              <rect x={-170} y={-120} width={340} height={240} rx={26} fill={C.mid} filter="url(#soft)" />
              <path d="M-160 -110 L0 10 L160 -110" fill="none" stroke="#fff" strokeWidth={8} />
              <Txt x={0} y={180} size={44} weight={900}>{`Minggu ${i + 1}`}</Txt>
              <g opacity={prog(t, t300 + i * 0.1, 0.3)}><Txt x={0} y={60} size={46} weight={900} fill="#fff">Rp300 rb</Txt></g>
            </g>
          );
        })}
      </Shot>
      <Shot t={t} a={tJadi - 0.1} b={tTerus2 - 0.1} inn="left" out="zoom" push={0.06}>
        <Room t={t} floor={C.light} floorY={940} />
        {DAYS.map((d, i) => {
          const lvl = Math.max(0.06, 1 - i * 0.3);
          const show = i <= 2;
          return (
            <g key={d} transform={`translate(${260 + i * 235} 600) scale(${pop(t, tRabu - 0.6 + i * 0.08)})`}>
              <rect x={-90} y={-300} width={180} height={560} rx={30} fill="#fff" filter="url(#soft)" />
              {show && <rect x={-66} y={236 - 500 * lvl * prog(t, tRabu - 0.4 + i * 0.1, 0.6)} width={132} height={500 * lvl * prog(t, tRabu - 0.4 + i * 0.1, 0.6)} rx={18} fill={i === 2 ? C.amber : C.mid} />}
              <Txt x={0} y={320} size={44} weight={900}>{d}</Txt>
            </g>
          );
        })}
        <Stamp x={1300} y={300} t={t} t0={tRem - 0.2} text="REM SEKARANG" size={64} />
      </Shot>
      <Shot t={t} a={tTerus2 - 0.1} b={tTgl - 0.1} inn="zoom" out="left" push={0.07}>
        <Room t={t} floor={C.pale} />
        {(() => {
          const brk = prog(t, tLun + 0.4, 0.7, easeOut);
          return (
            <g>
              <Pic n="hand_phone" x={360 - brk * 160} y={620} w={420} r={-8 - brk * 10} />
              <Pic n="bag" x={1560 + brk * 160} y={620} w={420} r={8 + brk * 10} />
              {Array.from({ length: 8 }).map((_, i) => {
                const side = i < 4 ? -1 : 1;
                return <rect key={i} x={620 + i * 90 + side * brk * 120} y={560 + (i % 2 ? 1 : -1) * brk * 60} width={110} height={56} rx={28} fill="none" stroke={C.ink} strokeWidth={14}
                  transform={`rotate(${side * brk * 25} ${675 + i * 90} 588)`} />;
              })}
              <g transform={`translate(960 ${880})`} opacity={prog(t, tNam, 0.3)}>
                <rect x={-260} y={-70} width={520} height={140} rx={70} fill={C.ink} />
                <Txt x={0} y={4} size={52} weight={900} fill="#fff">+ cicilan baru</Txt>
                <Cross x={0} y={0} len={360} s={pop(t, tNam + 0.4)} o={clamp((t - tNam - 0.4) * 4)} />
              </g>
            </g>
          );
        })()}
      </Shot>
      <Shot t={t} a={tTgl - 0.1} b={tSek - 0.1} inn="left" out="zoom" push={0.08}>
        <Room t={t} floor={C.light} />
        <FlipCal x={600} y={560} w={500} f={9} />
        {t > tTgl + 0.5 && <Check x={820} y={300} s={pop(t, tTgl + 0.5) * 1.6} />}
        <g opacity={prog(t, tTapi, 0.3)}>
          {['Kos', 'Ibu', 'Cicilan', 'Tabungan', 'Mingguan'].map((l, i) => (
            <g key={l}>
              <path d={`M900 560 C1100 560 1150 ${240 + i * 150} 1330 ${240 + i * 150}`} stroke={C.primary} strokeWidth={8} fill="none" strokeDasharray={`${600 * prog(t, tTapi + i * 0.12, 0.5)} 600`} />
              <g transform={`translate(1520 ${240 + i * 150}) scale(${pop(t, tTapi + 0.3 + i * 0.12)})`}>
                <rect x={-190} y={-50} width={380} height={100} rx={50} fill={C.primary} /><Txt x={0} y={3} size={42} weight={900} fill="#fff">{l}</Txt>
              </g>
            </g>
          ))}
        </g>
      </Shot>
      <Shot t={t} a={tSek - 0.1} b={c.end + 3} inn="zoom" out="zoom" push={0.06}>
        <Room t={t} floor={C.deep2} floorY={960} dark />
        <g transform={`translate(960 540) scale(${pop(t, tSek, 0.6)})`}>
          <rect x={-700} y={-150} width={1400} height={300} rx={40} fill="#F4F2EC" filter="url(#soft)" />
          <circle cx={-570} cy={0} r={80} fill={C.primary} /><Person x={-570} y={12} s={1.3} col="#F4F2EC" />
          <Txt x={-460} y={6} size={72} weight={800} anchor="start">{typed.slice(0, nType)}</Txt>
          <rect x={-460 + nType * 38} y={-46} width={8} height={96} fill={C.primary} opacity={Math.floor(t * 2.5) % 2 ? 1 : 0} />
          <g opacity={prog(t, tKom, 0.3)}><rect x={430} y={-56} width={220} height={112} rx={56} fill={C.primary} /><Txt x={540} y={4} size={44} weight={900} fill="#fff">Kirim</Txt></g>
        </g>
      </Shot>
    </g>
  );
};
