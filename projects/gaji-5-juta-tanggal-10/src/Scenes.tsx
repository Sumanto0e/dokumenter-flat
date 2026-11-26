import React from 'react';
import { C, Txt, Chip, Badge, cue, chap, prog, pop, win, lerp, clamp, rupiah, easeInOut, ph } from './lib';
import {
  Phone, Clock, Calendar, Envelope, Coin, Donut, Gauge, Waffle, QMark, Bag, CardIcon, Bill, Ticket, Wallet, QR, Jar,
  Person, Check, Cross, Arrow, Cup, Bubble,
} from './components';
import { Bab1v2 } from './v2';
import { Bab2v, Bab3v, Bab4v, Bab5v, Bab6v, Bab7v, Bab8v, Bab9v } from './v3';

type S = { t: number };
const tw = (t: number, steps: [number, number][], d = 0.8) => {
  // tween value through [time, value] steps
  let v = steps[0][1];
  for (let i = 1; i < steps.length; i++) v = lerp(v, steps[i][1], prog(t, steps[i][0], d, easeInOut));
  return v;
};

/* ---------------- BAB 1 ---------------- */
export const Bab1: React.FC<S> = ({ t }) => {
  const c = chap(1);
  const tJam10 = cue(1, '10', 0), tTgl = cue(1, '10', 1), tPad = cue(1, 'padahal'), tKalau = cue(1, 'kalau');
  const tLacak = cue(1, 'lacak'), tRup = cue(1, 'rupiah', 0), tAkhir = cue(1, 'akhir'), tMana = cue(1, 'mana');
  const tCara = cue(1, 'cara'), tMulai = cue(1, 'mulai');
  const bal = tw(t, [[0, 0], [c.start + 0.2, 5000000], [tJam10, 1470000], [tTgl, 66000]], 0.9);
  const red = prog(t, tTgl, 0.4);
  const A: [number, number] = [-99, tKalau];
  const shake = t > tTgl && t < tTgl + 0.5 ? Math.sin(t * 70) * 8 * (1 - (t - tTgl) / 0.5) : 0;
  const B: [number, number] = [tKalau + 0.2, tMulai];
  const out: [number, number] = [-99, tMulai];
  return (
    <g>
      {/* phase A: the phone */}
      <g {...ph(t, A)}>
        <Phone x={960 + shake} y={650} s={pop(t, c.start, 0.6) * 0.95} dark={t > tTgl}>
          <Txt x={0} y={-180} size={26} weight={600} fill={t > tTgl ? C.light : C.grey}>Saldo</Txt>
          <Txt x={0} y={-120} size={44} weight={900} fill={red > 0.5 ? '#FF8A7A' : C.ink}>{rupiah(bal)}</Txt>
          <rect x={-120} y={-60} width={240} height={10} rx={5} fill={C.light} />
          <rect x={-120} y={-60} width={240 * (bal / 5000000)} height={10} rx={5} fill={red > 0.5 ? C.red : C.primary} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-120} y={-10 + i * 70} width={240} height={50} rx={12} fill={t > tTgl ? C.deep2 : '#EEECE6'} />
          ))}
        </Phone>
        <g opacity={win(t, c.start + 0.3, tTgl)}>
          <Chip x={520} y={560} label={t < tJam10 ? '09:00' : '10:00'} fill={C.ink} size={40} s={pop(t, c.start + 0.3)} />
          <Txt x={520} y={640} size={28} italic weight={400}>gajian masuk</Txt>
        </g>
        <Calendar x={500} y={640} day="10" s={pop(t, tTgl)} o={clamp((t - tTgl) * 4)} hl={C.red} />
        <g opacity={win(t, tPad, tKalau)}>
          <Bag x={1420} y={650} s={pop(t, tPad) * 0.9} col={C.light} />
          <Txt x={1420} y={810} size={30} weight={800} fill="#F4F2EC">0 belanja</Txt>
        </g>
      </g>
      {/* phase B: the timeline 1..10 */}
      <g {...ph(t, B)}>
        <line x1={260} y1={700} x2={260 + 1400 * prog(t, tKalau + 0.2, 1)} y2={700} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        {Array.from({ length: 10 }).map((_, i) => {
          const x = 260 + i * (1400 / 9);
          const s = pop(t, tKalau + 0.25 + i * 0.07);
          return (
            <g key={i} transform={`translate(${x} 700) scale(${s})`}>
              <circle r={22} fill={i === 9 ? C.red : C.primary} />
              <Txt x={0} y={64} size={30} weight={800}>{`${i + 1}`}</Txt>
            </g>
          );
        })}
        <Txt x={260} y={800} size={26} italic weight={400} anchor="start">tanggal</Txt>
        {Array.from({ length: 10 }).map((_, i) => (
          <Coin key={i} x={260 + i * (1400 / 9)} y={560 - 30 * Math.sin(i)} s={pop(t, tRup + i * 0.12) * 0.8} o={clamp((t - tRup - i * 0.12) * 5) * (1 - prog(t, tAkhir, 0.4))} />
        ))}
        {/* magnifier tracking */}
        <g transform={`translate(${lerp(260, 1660, prog(t, tLacak, 2.4, easeInOut))} 700)`} opacity={win(t, tLacak, tAkhir)}>
          <circle r={70} fill="#fff" fillOpacity={0.35} stroke={C.ink} strokeWidth={14} />
          <rect x={50} y={50} width={90} height={26} rx={13} fill={C.ink} transform="rotate(45 50 50)" />
        </g>
        <QMark x={1280} y={500} s={pop(t, tMana) * 0.7} o={win(t, tMana, tMulai)} col={C.primary} />
        <g opacity={win(t, tCara, tMulai)}>
          <Badge x={700} y={470} r={80} s={pop(t, tCara)} fill={C.amber}>
            <path d="M-20 -30 a30 30 0 1 1 40 0 v22 h-40 z" fill="#fff" /><rect x={-16} y={0} width={32} height={10} rx={4} fill="#fff" />
          </Badge>
        </g>
      </g>
      <Clock x={960} y={640} h={9} m={0} R={220} s={pop(t, tMulai, 0.6) * 0.9} o={clamp((t - tMulai) * 3)} />
    </g>
  );
};

/* ---------------- BAB 2 ---------------- */
const SEG = [
  { k: 'kos', label: 'Kos', v: 1.5, amt: 'Rp1,5 jt' },
  { k: 'ibu', label: 'Kirim ibu', v: 0.75, amt: 'Rp750 rb' },
  { k: 'rp650', label: 'Cicilan HP', v: 0.65, amt: 'Rp650 rb' },
  { k: 'rp480', label: 'Paylater', v: 0.48, amt: 'Rp480 rb' },
  { k: 'rp150', label: 'Internet', v: 0.15, amt: 'Rp150 rb' },
];
export const Bab2: React.FC<S> = ({ t }) => {
  const c = chap(2);
  const tNotif = cue(2, 'notif'), t35 = cue(2, 'rp3,5'), t70 = cue(2, '70%'), tBelum = cue(2, 'belum', 1);
  const times = SEG.map((s) => cue(2, s.k));
  const mins = tw(t, [[0, 5], [times[0], 20], [times[1], 25], [times[2], 30], [times[3], 40], [times[4], 50], [t35, 60]], 0.7);
  const A: [number, number] = [-99, t70 - 0.1];
  const BH = 640, top = 330, x0 = 980, bw = 260, unit = BH / 5;
  let acc = 0;
  return (
    <g>
      <g {...ph(t, A)}>
        <Clock x={520} y={650} h={9 + Math.floor(mins / 60)} m={mins % 60} R={210} s={0.95 + 0.05 * pop(t, c.start)} />
        <Chip x={520} y={950} label={`${mins >= 60 ? '10' : '09'}:${String(Math.floor(mins % 60)).padStart(2, '0')}`} fill={C.ink} size={36} />
        {/* salary stack */}
        <g opacity={prog(t, tNotif, 0.4)}>
          <Txt x={x0 + bw / 2} y={top - 40} size={30} weight={800}>Gaji Rp5 jt</Txt>
          {SEG.map((s, i) => {
            const y = top + acc * unit; acc += s.v;
            const go = prog(t, times[i], 0.5);
            return (
              <g key={i}>
                <rect x={x0} y={y} width={bw} height={s.v * unit - 6} rx={10} fill={go > 0.5 ? 'none' : C.primary}
                  stroke={go > 0.5 ? C.red : 'none'} strokeWidth={4} strokeDasharray="10 8" />
                <g opacity={go} transform={`translate(${(1 - go) * -120} 0)`}>
                  <Chip x={1600} y={top + 20 + i * 105} label={`${s.label}  −${s.amt}`} fill={C.red} size={30} w={420} s={pop(t, times[i])} />
                </g>
              </g>
            );
          })}
          <rect x={x0} y={top + acc * unit} width={bw} height={1.47 * unit - 6} rx={10} fill={C.mid} />
          <Txt x={x0 + bw / 2} y={top + acc * unit + (1.47 * unit) / 2} size={30} weight={900} fill="#fff">Sisa</Txt>
          <g opacity={prog(t, t35, 0.4)}>
            <path d={`M${x0 - 30} ${top} h-20 v${3.53 * unit} h20`} fill="none" stroke={C.red} strokeWidth={8} />
            <Txt x={x0 - 70} y={top + (3.53 * unit) / 2} size={44} weight={900} fill={C.red} anchor="end">−Rp3,5 jt</Txt>
          </g>
        </g>
      </g>
      <g {...ph(t, [t70, 1e9])}>
        <Donut x={960} y={620} R={230} th={80} pct={0.7 * prog(t, t70, 1.0)} col={C.mid} bg={C.deep2} label="70%" lc="#F4F2EC" />
        <g opacity={prog(t, tBelum, 0.4)}>
          <Bag x={1440} y={640} s={pop(t, tBelum) * 0.8} col={C.light} />
          <Txt x={1440} y={790} size={30} weight={800} fill="#F4F2EC">belum belanja</Txt>
        </g>
      </g>
    </g>
  );
};

/* ---------------- BAB 3 ---------------- */
const MONTHS = ['Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb'];
export const Bab3: React.FC<S> = ({ t }) => {
  const c = chap(3);
  const tBukan = cue(3, 'bukan'), tHp = cue(3, 'hp-nya'), tCicil = cue(3, 'dicicil'), tPot = cue(3, 'kepotong');
  const tIni = cue(3, 'ini', 1), tDep = cue(3, 'depan', 0), tBer = cue(3, 'berikutnya'), tLunas = cue(3, 'lunas');
  const tPay = cue(3, 'paylater', 1), tTerima = cue(3, 'terima'), tArti = cue(3, 'artinya'), tMinjem = cue(3, 'minjem');
  const tSendiri = cue(3, 'sendirian'), t32 = cue(3, '32'), tNanya = cue(3, 'nanya'), tPakai = cue(3, 'kepakai');
  const A: [number, number] = [c.start - 0.2, tHp];
  const B: [number, number] = [tHp, tPay];
  const Cc: [number, number] = [tPay, tArti];
  const D: [number, number] = [tArti, tNanya];
  const E: [number, number] = [tNanya, 1e9];
  const biteT = [-1, tPot, tPot + 0.5, tIni, tDep, tBer, tBer + 0.4];
  return (
    <g>
      <g {...ph(t, A)}>
        <g transform={`translate(640 640) rotate(-4) scale(${pop(t, c.start + 0.3)})`}>
          <rect x={-230} y={-130} width={460} height={260} rx={28} fill="#fff" filter="url(#soft)" />
          <Txt x={0} y={-40} size={34} weight={600}>Cicilan HP</Txt><Txt x={0} y={30} size={60} weight={900} fill={C.red}>Rp650 rb</Txt>
        </g>
        <g transform={`translate(1280 640) rotate(4) scale(${pop(t, c.start + 0.8)})`}>
          <rect x={-230} y={-130} width={460} height={260} rx={28} fill="#fff" filter="url(#soft)" />
          <Txt x={0} y={-40} size={34} weight={600}>Paylater</Txt><Txt x={0} y={30} size={60} weight={900} fill={C.red}>Rp480 rb</Txt>
        </g>
        <g transform={`translate(960 860) rotate(-6) scale(${pop(t, tBukan)})`} opacity={clamp((t - tBukan) * 4)}>
          <rect x={-330} y={-50} width={660} height={100} rx={14} fill="none" stroke={C.red} strokeWidth={8} />
          <Txt x={0} y={4} size={40} weight={900} fill={C.red} ls={2}>BUKAN BELANJA HARI INI</Txt>
        </g>
      </g>
      <g {...ph(t, B)}>
        {MONTHS.map((m, i) => {
          const x = 330 + i * 210;
          const isNow = i === 3;
          return (
            <g key={m}>
              <Envelope x={x} y={620} w={170} s={pop(t, tHp + 0.1 + i * 0.08)} fill={isNow ? C.primary : C.light}
                label={m} sub={isNow ? 'bulan ini' : undefined} bite={i > 0 ? prog(t, biteT[i], 0.35) : 0} />
              {i > 0 && <g opacity={prog(t, biteT[i], 0.3)}><Txt x={x} y={500} size={26} weight={900} fill={C.red}>−650rb</Txt></g>}
            </g>
          );
        })}
        <g opacity={prog(t, tHp, 0.3)}>
          <rect x={300} y={420} width={60} height={110} rx={12} fill={C.ink} transform={`translate(0 ${-20 * pop(t, tHp)})`} />
          <Txt x={330} y={390} size={24} weight={700} italic>beli HP</Txt>
        </g>
        <path d={`M330 560 H${330 + 1260 * prog(t, tCicil, 1.6)}`} stroke={C.ink} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
        <g transform={`translate(1590 780) rotate(-8) scale(${pop(t, tLunas)})`} opacity={clamp((t - tLunas) * 4)}>
          <rect x={-110} y={-40} width={220} height={80} rx={12} fill="none" stroke={C.primary} strokeWidth={7} />
          <Txt x={0} y={4} size={40} weight={900} fill={C.primary}>LUNAS</Txt>
        </g>
      </g>
      <g {...ph(t, Cc)}>
        <Bag x={560} y={640} s={pop(t, tPay)} />
        <Txt x={560} y={810} size={30} weight={800}>belanja sekarang</Txt>
        <Envelope x={1360} y={620} w={260} dashed s={pop(t, tPay + 0.3)} label="Gaji bulan depan" sub="belum masuk" />
        <Arrow d="M1220 560 C1050 420 820 420 680 540" p={prog(t, tPay + 0.8, 0.9)} col={C.red} w={10} len={800} />
        <Coin x={lerp(1340, 600, prog(t, tTerima - 0.6, 1.2, easeInOut))} y={lerp(600, 470, Math.sin(prog(t, tTerima - 0.6, 1.2) * Math.PI))} s={0.8} o={win(t, tPay + 1, tArti)} />
      </g>
      <g {...ph(t, D)}>
        <g opacity={1 - prog(t, tSendiri, 0.4)}>
          <Badge x={560} y={640} r={100} s={pop(t, tArti)}><Person x={0} y={10} s={1.3} col="#F4F2EC" /></Badge>
          <Txt x={560} y={810} size={30} weight={800}>kamu sekarang</Txt>
          <Envelope x={1360} y={620} w={260} dashed label="Kamu di masa depan" />
          <Arrow d="M1230 540 C1060 380 760 380 650 520" p={prog(t, tMinjem, 0.9)} col={C.primary} w={10} len={800} />
          <g opacity={prog(t, tMinjem, 0.4)}><Chip x={950} y={400} label="minjem" fill={C.primary} size={34} /></g>
        </g>
        <g opacity={prog(t, tSendiri, 0.4)}>
          <Waffle x={960} y={640} cols={16} rows={7} size={44} gap={12} filled={prog(t, tSendiri, 2.2)} col={C.primary} off={C.pale} />
          <g opacity={prog(t, t32, 0.3)} transform={`translate(960 640) scale(${pop(t, t32)})`}>
            <rect x={-470} y={-110} width={940} height={220} rx={30} fill={C.paper} filter="url(#soft)" />
            <Txt x={0} y={-20} size={110} weight={900} ls={-3}>32 juta+</Txt>
            <Txt x={0} y={66} size={30} weight={400} italic>rekening paylater di bank · OJK, Juni 2026</Txt>
          </g>
        </g>
      </g>
      <g {...ph(t, E)}>
        <QMark x={700} y={640} s={pop(t, tNanya) * 0.9} col={C.light} />
        <Envelope x={1300} y={640} w={300} fill={C.light} s={pop(t, tPakai)} o={clamp((t - tPakai) * 3)} label="Gaji masuk" tc="#F4F2EC" />
        <g transform={`translate(1300 640) rotate(-10) scale(${pop(t, tPakai + 0.5)})`} opacity={clamp((t - tPakai - 0.5) * 4)}>
          <rect x={-170} y={-44} width={340} height={88} rx={12} fill={C.deep} stroke={C.red} strokeWidth={7} />
          <Txt x={0} y={4} size={40} weight={900} fill={C.red}>UDAH KEPAKAI</Txt>
        </g>
      </g>
    </g>
  );
};

/* ---------------- BAB 4 ---------------- */
export const Bab4: React.FC<S> = ({ t }) => {
  const c = chap(4);
  const t147 = cue(4, 'rp1,47'), tKen = cue(4, 'kenyataannya'), t66 = cue(4, 'rp66'), tBing = cue(4, 'bingung');
  const tBesar = cue(4, 'besar'), tMundur = cue(4, 'mundur'), t2001 = cue(4, '2001'), tEks = cue(4, 'eksperimen'), tMit = cue(4, 'mit');
  const level = tw(t, [[0, 1], [tKen, 0.75], [tKen + 1.5, 0.4], [t66 - 0.6, 0.05]], 1.2);
  const A: [number, number] = [-99, tBing];
  const B: [number, number] = [tBing, tMundur];
  const Cc: [number, number] = [tMundur, 1e9];
  const year = Math.round(tw(t, [[0, 2026], [tMundur + 0.2, 2001]], 1.4));
  const day = Math.min(10, 1 + Math.floor(clamp((t - tKen) / Math.max(0.5, t66 - tKen)) * 9));
  return (
    <g>
      <g {...ph(t, A)}>
        <Donut x={420} y={640} R={120} th={50} pct={0.7} col={C.red} bg={C.light} label="70%" s={0.9 + 0.1 * pop(t, c.start)} />
        <Txt x={420} y={830} size={28} italic weight={400}>udah keluar</Txt>
        <Jar x={960} y={650} level={level} s={pop(t, t147) * 1.2} />
        <Txt x={960} y={900} size={48} weight={900} fill={t > t66 ? C.red : C.ink}>{t > t66 ? 'Rp66 rb' : rupiah(level * 1470000)}</Txt>
        {Array.from({ length: 5 }).map((_, i) => {
          const ph = ((t - tKen) * 1.4 + i / 5) % 1;
          return t > tKen && t < t66 + 0.5 ? <ellipse key={i} cx={960 + (i - 2) * 30} cy={840 + ph * 140} rx={10} ry={14} fill={C.mid} opacity={1 - ph} /> : null;
        })}
        <Calendar x={1500} y={640} day={`${day}`} s={pop(t, tKen)} o={clamp((t - tKen) * 3)} hl={day >= 10 ? C.red : C.primary} />
      </g>
      <g {...ph(t, B)}>
        {Array.from({ length: 9 }).map((_, i) => <Coin key={i} x={560 + (i % 3) * 110} y={540 + Math.floor(i / 3) * 110} s={pop(t, tBing + i * 0.05) * 0.85} />)}
        <Txt x={670} y={880} size={30} weight={800}>receh-receh</Txt>
        <Bag x={1340} y={640} s={pop(t, tBesar) * 1.2} col={C.light} />
        <Cross x={1340} y={650} len={300} s={pop(t, tBesar + 0.2)} o={clamp((t - tBesar - 0.2) * 4)} />
        <Txt x={1340} y={880} size={30} weight={800}>belanja besar</Txt>
      </g>
      <g {...ph(t, Cc)}>
        <Txt x={960} y={600} size={260} weight={900} fill="#F4F2EC" ls={-8}>{`${year}`}</Txt>
        <g opacity={prog(t, tEks, 0.4)}>
          <Badge x={760} y={860} r={70} s={pop(t, tEks)} fill={C.primary}>
            <path d="M-16 -40 h32 v30 l28 50 a10 10 0 0 1 -8 14 h-72 a10 10 0 0 1 -8 -14 l28 -50 z" fill="#fff" />
          </Badge>
          <g opacity={prog(t, tMit, 0.3)}><Chip x={1080} y={860} label="MIT" fill="#F4F2EC" color={C.deep} size={52} s={pop(t, tMit)} /></g>
        </g>
      </g>
    </g>
  );
};

/* ---------------- BAB 5 ---------------- */
export const Bab5: React.FC<S> = ({ t }) => {
  const c = chap(5);
  const tLel = cue(5, 'melelang'), tSep = cue(5, 'separuh'), tTun = cue(5, 'tunai', 0), tSepN = cue(5, 'separuhnya');
  const tKar = cue(5, 'kartu', 0), tSama = cue(5, 'sama', 0), tHas = cue(5, 'hasilnya'), t29 = cue(5, '29'), t61 = cue(5, '61');
  const tLebih = cue(5, 'lebih'), tPen = cue(5, 'penelitian'), tQris = cue(5, 'qris'), tEw = cue(5, 'e-wallet'), tDom = cue(5, 'dompet');
  const dark = t < tSep;
  const A: [number, number] = [c.start - 0.3, tSep];
  const B: [number, number] = [tSep, tHas];
  const Cc: [number, number] = [tHas, tPen];
  const D: [number, number] = [tPen, 1e9];
  const fg = '#F4F2EC';
  return (
    <g>
      <g {...ph(t, A)}>
        <Badge x={620} y={600} r={110} s={pop(t, c.start + 0.2)} fill={C.primary}><Person x={0} y={14} s={1.5} col={fg} /></Badge>
        <Txt x={620} y={770} size={32} weight={800} fill={fg}>Drazen Prelec</Txt>
        <Badge x={1300} y={600} r={110} s={pop(t, c.start + 0.8)} fill={C.primary}><Person x={0} y={14} s={1.5} col={fg} /></Badge>
        <Txt x={1300} y={770} size={32} weight={800} fill={fg}>Duncan Simester</Txt>
        <Ticket x={960} y={880} s={pop(t, tLel) * 0.9} o={clamp((t - tLel) * 3)} />
      </g>
      <g {...ph(t, B)}>
        {Array.from({ length: 20 }).map((_, i) => {
          const left = i < 10;
          const gx = (left ? 400 : 1150) + (i % 5) * 90, gy = 520 + Math.floor((i % 10) / 5) * 120;
          const on = left ? prog(t, tTun, 0.3) : prog(t, tKar, 0.3);
          return <Person key={i} x={gx + 45} y={gy} s={pop(t, tSep + i * 0.03) * 0.9} col={on > 0.5 ? (left ? C.mid : C.amber) : C.grey} />;
        })}
        <g opacity={prog(t, tTun, 0.3)}><Bill x={625} y={800} s={0.7} /><Txt x={625} y={900} size={34} weight={900}>TUNAI</Txt></g>
        <g opacity={prog(t, tKar, 0.3)}><CardIcon x={1375} y={800} s={0.6} col={C.amber} /><Txt x={1375} y={900} size={34} weight={900}>KARTU KREDIT</Txt></g>
        <g opacity={prog(t, tSama, 0.3)}>
          <Ticket x={760} y={380} s={0.55} /><Txt x={960} y={385} size={80} weight={900}>=</Txt><Ticket x={1160} y={380} s={0.55} />
        </g>
        <g opacity={prog(t, tSepN, 0.2) * 0}><text /></g>
      </g>
      <g {...ph(t, Cc)}>
        <line x1={460} y1={900} x2={1460} y2={900} stroke={C.ink} strokeWidth={6} />
        {[{ x: 720, v: 29, tt: t29, col: C.mid, l: 'Tunai' }, { x: 1200, v: 61, tt: t61, col: C.amber, l: 'Kartu' }].map((b) => {
          const h = b.v * 8.5 * prog(t, b.tt - 0.15, 0.7);
          return (
            <g key={b.l}>
              <rect x={b.x - 110} y={900 - h} width={220} height={h} rx={10} fill={b.col} />
              <g opacity={prog(t, b.tt, 0.3)}><Txt x={b.x} y={900 - h - 50} size={64} weight={900}>{`$${b.v}`}</Txt></g>
              <Txt x={b.x} y={950} size={32} weight={800}>{b.l}</Txt>
            </g>
          );
        })}
        <g opacity={prog(t, tLebih, 0.3)} transform={`translate(1460 520) scale(${pop(t, tLebih)})`}>
          <Chip x={0} y={0} label="2× lipat" fill={C.red} size={44} />
        </g>
      </g>
      <g {...ph(t, D)}>
        <CardIcon x={480} y={620} s={pop(t, tPen) * 0.8} col={C.amber} />
        <Txt x={720} y={620} size={90} weight={900}>≈</Txt>
        <QR x={960} y={620} s={pop(t, tQris) * 0.9} o={clamp((t - tQris) * 3)} />
        <g opacity={clamp((t - tEw) * 3)}>
          <Phone x={1400} y={640} s={pop(t, tEw) * 0.55}><Txt x={0} y={-60} size={44} weight={900}>e-wallet</Txt><Coin x={0} y={60} s={1.3} /></Phone>
        </g>
        <Wallet x={960} y={920} s={pop(t, tDom) * 0.55} o={clamp((t - tDom) * 3)} />
      </g>
      {dark && null}
    </g>
  );
};

/* ---------------- BAB 6 ---------------- */
export const Bab6: React.FC<S> = ({ t }) => {
  const c = chap(6);
  const tPain = cue(6, 'pain'), tKalau = cue(6, 'kalau', 0), tPindah = cue(6, 'pindah'), tHp = cue(6, 'hp');
  const tScan = cue(6, 'scan'), tTring = cue(6, 'tring'), tSel = cue(6, 'selesai'), tSakit = cue(6, 'sakit', 1);
  const tRem = cue(6, 'ngerem'), tCatat = cue(6, 'catat'), tKel = cue(6, 'kelihatan');
  const needle = tw(t, [[0, 0.5], [c.start + 0.3, 0.15], [tPindah - 0.3, 0.88], [tScan, 0.3], [tSel, 0.08], [tSakit, 0.02]], 0.9);
  const A: [number, number] = [c.start - 0.3, tPain - 0.1];
  const P: [number, number] = [tPain, tKalau];
  const B: [number, number] = [tKalau, tKel];
  const D: [number, number] = [tKel, 1e9];
  return (
    <g>
      <g {...ph(t, A)}>
        <Gauge x={960} y={820} v={needle} s={pop(t, c.start) * 1.1} />
        <Txt x={960} y={930} size={34} weight={800}>rasa “sakit” waktu bayar</Txt>
      </g>
      <g {...ph(t, P)}>
        <Txt x={960} y={600} size={170} weight={900} fill="#F4F2EC" ls={-5}>pain of paying</Txt>
        <Txt x={960} y={740} size={44} italic weight={400} fill={C.light}>rasa sakit waktu bayar</Txt>
      </g>
      <g {...ph(t, B)}>
        <Gauge x={960} y={920} v={needle} R={170} s={0.9} />
        <g opacity={1 - prog(t, tHp, 0.4) * 0.65}>
          <Wallet x={330} y={520} s={0.55} />
          <Bill x={lerp(330, 640, prog(t, tPindah - 0.4, 0.9, easeInOut))} y={lerp(520, 520, 0)} s={0.5} r={lerp(0, 12, prog(t, tPindah - 0.4, 0.9))} />
          <Badge x={700} y={520} r={70} fill={C.ink}><path d="M-34 -10 h68 l-8 44 h-52 z M-20 -10 v-14 a20 20 0 0 1 40 0 v14" fill="none" stroke="#fff" strokeWidth={6} /></Badge>
          <Txt x={520} y={690} size={34} weight={900}>TUNAI</Txt>
        </g>
        <g opacity={prog(t, tHp, 0.4)}>
          <Phone x={1380} y={560} s={0.6 * pop(t, tHp)}>
            <QR x={0} y={-20} s={0.9} />
            <rect x={-110} y={lerp(-130, 90, ((t - tScan) * 1.5) % 1)} width={220} height={8} rx={4} fill={C.red} opacity={win(t, tScan, tTring)} />
            {t > tSel && <Check x={0} y={-20} s={pop(t, tSel) * 1.4} />}
          </Phone>
          {[0, 1, 2].map((i) => {
            const ph = clamp((t - tTring - i * 0.15) / 0.8);
            return ph > 0 && ph < 1 ? <circle key={i} cx={1380} cy={560} r={150 + ph * 200} fill="none" stroke={C.mid} strokeWidth={8} opacity={1 - ph} /> : null;
          })}
          <Txt x={1380} y={800} size={34} weight={900}>PAKAI HP</Txt>
        </g>
        <g opacity={prog(t, tRem, 0.3)}>
          <Chip x={960} y={640} label="nggak ada yang bikin ngerem" fill={C.red} size={34} s={pop(t, tRem)} />
        </g>
      </g>
      <g {...ph(t, D)}>
        <g transform={`translate(960 ${lerp(1200, 620, prog(t, tCatat - 0.3, 1.2))})`}>
          <rect x={-240} y={-400} width={480} height={800} fill="#fff" filter="url(#soft)" />
          {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-190} y={-330 + i * 70} width={260 - (i % 3) * 50} height={18} rx={9} fill={C.light} />)}
        </g>
      </g>
    </g>
  );
};

/* ---------------- BAB 7 ---------------- */
const ITEMS = [
  { k: 'makan', l: 'Makan', calc: 'Rp60rb × 9', v: 540 },
  { k: 'kopi', l: 'Kopi & jajan', calc: 'Rp35rb × 9', v: 315 },
  { k: 'nongkrong', l: 'Nongkrong', calc: 'akhir pekan', v: 250 },
  { k: 'checkout', l: 'Flash sale', calc: 'tengah malam', v: 199 },
  { k: 'bensin', l: 'Bensin & ojek', calc: '', v: 100 },
];
export const Bab7: React.FC<S> = ({ t }) => {
  const c = chap(7);
  const ts = ITEMS.map((i) => cue(7, i.k));
  const tTot = cue(7, 'totalnya'), tSisa = cue(7, 'sisa'), tNg = cue(7, 'nggak', 0), tMalah = cue(7, 'malah');
  const hi = prog(t, tMalah, 0.4);
  return (
    <g>
      <g transform={`translate(560 655) scale(0.84)`}>
        <rect x={-300} y={-430} width={600} height={880} fill="#fff" filter="url(#soft)" />
        <path d={`M-300 450 ${Array.from({ length: 15 }).map((_, i) => `l20 18 l20 -18`).join(' ')}`} fill="#fff" />
        <Txt x={0} y={-370} size={30} weight={900} ls={4}>STRUK 9 HARI</Txt>
        <line x1={-250} y1={-330} x2={250} y2={-330} stroke={C.ink} strokeWidth={3} strokeDasharray="8 8" />
        {ITEMS.map((it, i) => {
          const o = prog(t, ts[i], 0.3);
          const y = -270 + i * 100;
          const dim = hi > 0 && i !== 1 && i !== 3 ? 1 - hi * 0.6 : 1;
          return (
            <g key={i} opacity={o * dim} transform={`translate(${(1 - o) * -30} 0)`}>
              <Txt x={-250} y={y} size={34} weight={800} anchor="start">{it.l}</Txt>
              <Txt x={-250} y={y + 38} size={24} weight={400} italic anchor="start" opacity={0.7}>{it.calc}</Txt>
              <Txt x={250} y={y} size={34} weight={900} anchor="end">{`Rp${it.v} rb`}</Txt>
            </g>
          );
        })}
        <g opacity={prog(t, tTot, 0.3)}>
          <line x1={-250} y1={230} x2={250} y2={230} stroke={C.ink} strokeWidth={3} strokeDasharray="8 8" />
          <Txt x={-250} y={280} size={36} weight={900} anchor="start">Total</Txt>
          <Txt x={250} y={280} size={36} weight={900} anchor="end">Rp1.404.000</Txt>
        </g>
        <g opacity={prog(t, tSisa, 0.3)}>
          <Txt x={-250} y={350} size={36} weight={900} anchor="start" fill={C.red}>Sisa saldo</Txt>
          <Txt x={250} y={350} size={36} weight={900} anchor="end" fill={C.red}>Rp66.000</Txt>
        </g>
      </g>
      {/* bars */}
      <g opacity={prog(t, ts[0], 0.4)}>
        {ITEMS.map((it, i) => {
          const w = it.v * 1.1 * prog(t, ts[i], 0.6);
          const y = 330 + i * 120;
          const isHi = i === 1 || i === 3;
          const col = hi > 0 && isHi ? (i === 1 ? C.amber : C.light) : C.primary;
          return (
            <g key={i} opacity={hi > 0 && !isHi ? 1 - hi * 0.7 : 1}>
              <Txt x={1100} y={y - 32} size={26} weight={700} anchor="start">{it.l}</Txt>
              <rect x={1100} y={y - 10} width={w} height={56} rx={10} fill={col} />
            </g>
          );
        })}
        <g opacity={prog(t, tNg, 0.3) * (1 - hi)}>
          <Chip x={1400} y={940} label="nggak ada yang besar" fill={C.ink} size={32} />
        </g>
        <g opacity={hi}>
          <Chip x={1590} y={460} label="kopi > flash sale" fill={C.red} size={36} s={pop(t, tMalah)} />
        </g>
      </g>
    </g>
  );
};

/* ---------------- BAB 8 ---------------- */
export const Bab8: React.FC<S> = ({ t }) => {
  const c = chap(8);
  const tStop = cue(8, 'stop'), tJujur = cue(8, 'jujur'), tIngat = cue(8, 'ingat'), tKos = cue(8, 'kos'), tTua = cue(8, 'tua');
  const tCic = cue(8, 'cicilan'), tPas = cue(8, 'pas-pasan'), tJaw = cue(8, 'jawaban'), tPer = cue(8, 'pertama'), tKed = cue(8, 'kedua');
  const tKabar = cue(8, 'kabar'), tGaj = cue(8, 'gajian');
  const A: [number, number] = [c.start - 0.3, tIngat];
  const B: [number, number] = [tIngat, tJaw];
  const Cc: [number, number] = [tJaw, tKabar];
  const D: [number, number] = [tKabar, 1e9];
  return (
    <g>
      <g {...ph(t, A)}>
        <Cup x={620} y={680} s={pop(t, c.start + 0.2) * 1.5} />
        <Bubble x={1220} y={520} w={720} h={170} text="“Stop ngopi, nanti kaya”" s={pop(t, tStop)} o={clamp((t - tStop) * 4)} />
        <Cross x={1220} y={520} len={420} s={pop(t, tJujur)} o={clamp((t - tJujur) * 4)} />
      </g>
      <g {...ph(t, B)}>
        <Donut x={700} y={640} R={220} th={90} pct={0.7 * prog(t, tIngat, 1)} col={C.primary} bg={C.amber} />
        <Txt x={700} y={646} size={90} weight={900}>70%</Txt>
        {[{ l: 'Kos', tt: tKos }, { l: 'Orang tua', tt: tTua }, { l: 'Cicilan', tt: tCic }].map((x, i) => (
          <g key={x.l} opacity={prog(t, x.tt, 0.3)}><Chip x={1220} y={430 + i * 100} label={x.l} fill={C.primary} size={36} s={pop(t, x.tt)} /></g>
        ))}
        <g opacity={prog(t, tPas, 0.3)}>
          <Chip x={1300} y={800} label="sisa Rp1,47 jt / sebulan = pas-pasan" fill={C.amber} color={C.ink} size={32} s={pop(t, tPas)} />
        </g>
      </g>
      <g {...ph(t, Cc)}>
        {[{ x: 600, tt: tPer, n: '1', h: 'Udah ada tujuannya', s: 'sebelum gaji masuk' }, { x: 1320, tt: tKed, n: '2', h: 'Sisanya bocor', s: 'nggak dibagi + bayar nggak kerasa' }].map((k) => (
          <g key={k.n} transform={`translate(${k.x} 650) scale(${pop(t, k.tt)})`} opacity={clamp((t - k.tt) * 4)}>
            <rect x={-310} y={-220} width={620} height={440} rx={34} fill="#fff" filter="url(#soft)" />
            <Badge x={0} y={-90} r={70} fill={k.n === '1' ? C.primary : C.red}><Txt x={0} y={4} size={70} weight={900} fill="#fff">{k.n}</Txt></Badge>
            <Txt x={0} y={50} size={44} weight={900}>{k.h}</Txt>
            <Txt x={0} y={110} size={28} weight={400} italic>{k.s}</Txt>
          </g>
        ))}
        <g opacity={prog(t, tJaw, 0.3) * (1 - prog(t, tPer, 0.3))}><Txt x={960} y={640} size={120} weight={900}>2 jawaban</Txt></g>
      </g>
      <g {...ph(t, D)}>
        <Calendar x={960} y={640} day="1" top="GAJIAN" s={pop(t, tGaj - 0.3) * 1.5} o={clamp((t - tGaj + 0.3) * 3)} />
        <Coin x={1180} y={480} s={pop(t, tGaj) * 0.9} o={clamp((t - tGaj) * 3)} />
      </g>
    </g>
  );
};

/* ---------------- BAB 9 ---------------- */
export const Bab9: React.FC<S> = ({ t }) => {
  const c = chap(9);
  const tWajib = cue(9, 'wajib'), tPind = cue(9, 'pindahin'), tTab = cue(9, 'tabungan'), tSis = cue(9, 'sisanya'), tEw = cue(9, 'e-wallet');
  const tMing = cue(9, 'minggu'), t300 = cue(9, 'rp300'), tRabu = cue(9, 'rabu'), tRem = cue(9, 'ngerem'), tLun = cue(9, 'lunasi');
  const tNam = cue(9, 'nambah'), tTgl = cue(9, 'tanggal', 1), tRup = cue(9, 'rupiahnya'), tSek = cue(9, 'sekarang', 1), tKom = cue(9, 'komentar');
  const A: [number, number] = [c.start - 0.3, tRabu];
  const B: [number, number] = [tRabu, tLun];
  const Cc: [number, number] = [tLun, tTgl];
  const D: [number, number] = [tTgl, tSek];
  const E: [number, number] = [tSek, 1e9];
  const typed = 'Gaji aku habis tanggal ';
  const nType = Math.floor(clamp((t - tSek - 0.4) / 1.6) * typed.length);
  const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  return (
    <g>
      <g {...ph(t, A)}>
        <g transform={`translate(960 330) scale(${pop(t, c.start)})`}>
          <rect x={-190} y={-60} width={380} height={120} rx={24} fill={C.ink} />
          <Txt x={0} y={4} size={44} weight={900} fill="#F4F2EC">Gaji Rp5 jt</Txt>
        </g>
        <g opacity={prog(t, tWajib, 0.4)}>
          <Arrow d="M860 400 L420 560" p={prog(t, tWajib, 0.6)} w={8} len={500} />
          <g transform={`translate(380 640) scale(${pop(t, tWajib)})`}>
            <rect x={-200} y={-80} width={400} height={160} rx={24} fill={C.light} />
            <Txt x={0} y={-20} size={34} weight={900}>Wajib Rp3,53 jt</Txt>
            <Txt x={0} y={30} size={24} italic weight={400}>kos · ibu · cicilan · paylater</Txt>
          </g>
        </g>
        <g opacity={prog(t, tPind, 0.4)}>
          <Arrow d="M960 400 L960 500" p={prog(t, tPind, 0.5)} w={8} len={200} />
          <Jar x={960} y={680} level={prog(t, tTab, 1.2) * 0.75} s={0.75} label="Tabungan Rp250 rb" />
        </g>
        <g opacity={prog(t, tSis, 0.4)}>
          <Arrow d="M1060 400 L1460 520" p={prog(t, tSis, 0.6)} w={8} len={500} />
          <Phone x={1520} y={640} s={pop(t, tEw) * 0.42}><Txt x={0} y={-40} size={52} weight={900}>e-wallet</Txt><Txt x={0} y={40} size={56} weight={900} fill={C.primary}>Rp1,2 jt</Txt></Phone>
        </g>
        <g opacity={prog(t, tMing, 0.4)}>
          {[0, 1, 2, 3].map((i) => (
            <Envelope key={i} x={1260 + i * 150} y={940} w={120} s={pop(t, tMing + i * 0.12)} fill={C.mid} />
          ))}
          <g opacity={prog(t, t300, 0.3)}><Chip x={1485} y={850} label="Rp300 rb / minggu" fill={C.ink} size={28} /></g>
        </g>
      </g>
      <g {...ph(t, B)}>
        {DAYS.map((d, i) => {
          const lvl = 1 - i * 0.28;
          const isRab = i === 2;
          return (
            <g key={d} transform={`translate(${420 + i * 180} 640) scale(${pop(t, tRabu + i * 0.05)})`}>
              <rect x={-60} y={-160} width={120} height={300} rx={20} fill="#fff" filter="url(#soft)" />
              <rect x={-44} y={124 - 260 * Math.max(0.05, lvl)} width={88} height={260 * Math.max(0.05, lvl)} rx={12} fill={isRab ? C.amber : lvl > 0.3 ? C.mid : C.light} opacity={i <= 2 ? 1 : 0.25} />
              <Txt x={0} y={200} size={32} weight={800}>{d}</Txt>
            </g>
          );
        })}
        <g opacity={prog(t, tRem, 0.3)}><Chip x={780} y={380} label="tipis → REM sekarang" fill={C.red} size={36} s={pop(t, tRem)} /></g>
      </g>
      <g {...ph(t, Cc)}>
        <Chip x={620} y={600} label="Cicilan HP" fill={C.light} color={C.ink} size={40} />
        <Chip x={1300} y={600} label="Paylater" fill={C.light} color={C.ink} size={40} />
        {Array.from({ length: 6 }).map((_, i) => {
          const brk = prog(t, tLun + 0.3, 0.6);
          const dx = (i < 3 ? -1 : 1) * brk * 60, dy = brk * (i % 2 ? 40 : -30);
          return <rect key={i} x={790 + i * 60 + dx} y={585 + dy} width={70} height={34} rx={17} fill="none" stroke={C.ink} strokeWidth={8} transform={`rotate(${brk * (i < 3 ? -15 : 15)} ${825 + i * 60} 600)`} />;
        })}
        <g opacity={prog(t, tNam, 0.3)} transform={`translate(960 820) scale(${pop(t, tNam)})`}>
          <Txt x={-120} y={0} size={110} weight={900} fill={C.ink}>+</Txt><Txt x={40} y={0} size={44} weight={900}>baru</Txt>
          <Cross x={-40} y={0} len={220} s={1} />
        </g>
      </g>
      <g {...ph(t, D)}>
        <Calendar x={760} y={640} day="10" s={pop(t, tTgl) * 1.3} />
        <Check x={900} y={500} s={pop(t, tTgl + 0.4)} o={clamp((t - tTgl - 0.4) * 4)} />
        <g opacity={prog(t, tRup, 0.4)}>
          {['Kos', 'Ibu', 'Cicilan', 'Tabungan', 'Mingguan'].map((l, i) => (
            <g key={l}>
              <Arrow d={`M940 640 L1200 ${400 + i * 120}`} p={prog(t, tRup + i * 0.1, 0.4)} w={5} len={400} col={C.primary} />
              <g opacity={prog(t, tRup + i * 0.1 + 0.2, 0.3)}><Chip x={1350} y={400 + i * 120} label={l} fill={C.primary} size={30} /></g>
            </g>
          ))}
        </g>
      </g>
      <g {...ph(t, E)}>
        <g transform={`translate(960 640) scale(${pop(t, tSek)})`}>
          <rect x={-560} y={-110} width={1120} height={220} rx={30} fill="#F4F2EC" />
          <Badge x={-450} y={0} r={56} fill={C.primary} ring={false}><Person x={0} y={8} s={0.9} col="#F4F2EC" /></Badge>
          <Txt x={-360} y={4} size={52} weight={700} anchor="start">{typed.slice(0, nType)}</Txt>
          <rect x={-360 + nType * 27.5} y={-30} width={6} height={64} fill={C.primary} opacity={Math.floor(t * 2.5) % 2 ? 1 : 0} />
          <g opacity={prog(t, tKom, 0.3)}><Chip x={420} y={0} label="Kirim" fill={C.primary} size={34} /></g>
        </g>
      </g>
    </g>
  );
};

export const SCENES = [Bab1v2, Bab2v, Bab3v, Bab4v, Bab5v, Bab6v, Bab7v, Bab8v, Bab9v];

/** dark background windows [start, end] */
export const darkWindows = (): [number, number][] => [
  [cue(1, '10', 1) - 0.1, cue(1, 'kalau') - 0.15],
  [cue(2, '70%') - 0.15, chap(3).start - 0.35],
  [cue(3, 'nanya') - 0.1, chap(4).start - 0.35],
  [cue(4, 'mundur') - 0.1, cue(5, 'separuh') - 0.15],
  [cue(6, 'pain') - 0.1, cue(6, 'kalau', 0) - 0.15],
  [cue(8, 'kabar') - 0.1, chap(9).start - 0.35],
  [cue(9, 'sekarang', 1) - 0.1, 9999],
];
