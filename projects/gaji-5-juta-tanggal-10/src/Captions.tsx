import React from 'react';
import { WORDS, Word, C, FONT, clamp } from './lib';

type Phrase = { words: Word[]; start: number; end: number; split: number };

const glue = new Set(['juta', 'juta,', 'juta.', 'ribu', 'ribu.', 'ribu,', 'dolar', 'dolar.', 'dolar,', 'persen']);

const build = (): Phrase[] => {
  const out: Phrase[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    const n = cur.length;
    const split = n <= 2 ? 0 : Math.max(1, Math.round(n * 0.4));
    out.push({ words: cur, start: cur[0].start, end: cur[n - 1].end, split });
    cur = [];
  };
  WORDS.forEach((w, i) => {
    const next = WORDS[i + 1];
    if (cur.length && cur[0].bab !== w.bab) flush();
    cur.push(w);
    const punct = /[.,:?!"]$/.test(w.text);
    const nextGlued = next && glue.has(next.text.toLowerCase());
    if ((punct || cur.length >= 6) && !nextGlued) flush();
  });
  flush();
  // display windows
  out.forEach((p, i) => {
    const nx = out[i + 1];
    const hold = p.end + 0.7;
    p.end = nx && nx.start - p.end < 1.2 ? nx.start - 0.03 : nx ? Math.min(hold, nx.start - 0.03) : hold;
  });
  return out;
};
const PHRASES = build();

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, x: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(x))).join(',')})`;
};

export const Captions: React.FC<{ t: number; dark: boolean; y?: number; x?: number }> = ({ t, dark, y = 150, x = 960 }) => {
  const p = PHRASES.find((ph) => t >= ph.start - 0.06 && t <= ph.end);
  if (!p) return null;
  const ink = dark ? '#F4F2EC' : C.ink;
  const ghost = dark ? '#5E8C78' : '#B9BDB6';
  const out = clamp((p.end - t) / 0.12);
  const lead = p.words.slice(0, p.split);
  const punch = p.words.slice(p.split);
  const span = (w: Word, k: number) => {
    const a = clamp((t - w.start + 0.05) / 0.1);
    const c = clamp((t - w.start) / 0.28);
    return (
      <tspan key={k} fill={mix(ghost, ink, c)} opacity={a}>
        {w.text.replace(/^"|"$/g, '').replace(/"/g, '') + ' '}
      </tspan>
    );
  };
  return (
    <g opacity={out}>
      {lead.length > 0 && (
        <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontStyle="italic" fontWeight={400} fontSize={40}>
          {lead.map(span)}
        </text>
      )}
      <text x={x} y={lead.length ? y + 70 : y + 30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={68} letterSpacing={-1}>
        {punch.map(span)}
      </text>
    </g>
  );
};
