/**
 * hanji's continuous corners for icon paths.
 *
 * Tabler rounds corners with circular quarter arcs. hanji draws corners the way its surfaces are
 * drawn: the curve starts earlier along each straight edge and meets it with no jump in curvature,
 * so the corner reads as one continuous stroke (a squircle) instead of a line plus a circle.
 *
 * For every axis-aligned quarter arc of radius r ≤ MAX_R that sits between two straight segments,
 * the curve's ends move back along those segments by up to SMOOTHING·r (never more than 45% of a
 * segment, so neighbouring corners never collide), and the arc becomes a cubic whose handles keep
 * the corner's visual depth: the curve passes the corner's diagonal where the circle did. Arcs
 * without straight neighbours keep their size and become the usual circle-matched cubic.
 */

export const MAX_R = 4.5;
export const SMOOTHING = 0.6;

type Pt = readonly [number, number];
type Seg =
  | { t: 'M'; p: Pt }
  | { t: 'L'; p: Pt }
  | { t: 'C'; c1: Pt; c2: Pt; p: Pt }
  | { t: 'Q'; c: Pt; p: Pt }
  | { t: 'A'; rx: number; ry: number; rot: number; large: number; sweep: number; p: Pt }
  | { t: 'Z' };

const NUM = /-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/iy;

function tokenize(d: string): (string | number)[] {
  const out: (string | number)[] = [];
  let i = 0;
  while (i < d.length) {
    const ch = d[i] as string;
    if (/[a-z]/i.test(ch)) {
      out.push(ch);
      i++;
    } else if (/[\s,]/.test(ch)) {
      i++;
    } else {
      NUM.lastIndex = i;
      const m = NUM.exec(d);
      if (!m) throw new Error(`Bad path data at ${i}: ${d.slice(i, i + 12)}`);
      out.push(Number(m[0]));
      i += m[0].length;
    }
  }
  return out;
}

/** Parse to absolute segments: H/V → L, S → C, T → Q, relative → absolute. */
export function parse(d: string): Seg[] {
  const tk = tokenize(d);
  const segs: Seg[] = [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let lastC: Pt | null = null;
  let lastQ: Pt | null = null;
  const n = (): number => {
    const v = tk[i++];
    if (typeof v !== 'number') throw new Error(`Expected a number in ${d}`);
    return v;
  };
  while (i < tk.length) {
    if (typeof tk[i] === 'string') cmd = tk[i++] as string;
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    let nextC: Pt | null = null;
    let nextQ: Pt | null = null;
    switch (C) {
      case 'M': {
        x = ox + n();
        y = oy + n();
        sx = x;
        sy = y;
        segs.push({ t: 'M', p: [x, y] });
        cmd = rel ? 'l' : 'L';
        break;
      }
      case 'L':
        x = ox + n();
        y = oy + n();
        segs.push({ t: 'L', p: [x, y] });
        break;
      case 'H':
        x = ox + n();
        segs.push({ t: 'L', p: [x, y] });
        break;
      case 'V':
        y = oy + n();
        segs.push({ t: 'L', p: [x, y] });
        break;
      case 'C': {
        const c1: Pt = [ox + n(), oy + n()];
        const c2: Pt = [ox + n(), oy + n()];
        x = ox + n();
        y = oy + n();
        segs.push({ t: 'C', c1, c2, p: [x, y] });
        nextC = c2;
        break;
      }
      case 'S': {
        const c1: Pt = lastC ? [2 * x - lastC[0], 2 * y - lastC[1]] : [x, y];
        const c2: Pt = [ox + n(), oy + n()];
        x = ox + n();
        y = oy + n();
        segs.push({ t: 'C', c1, c2, p: [x, y] });
        nextC = c2;
        break;
      }
      case 'Q': {
        const c: Pt = [ox + n(), oy + n()];
        x = ox + n();
        y = oy + n();
        segs.push({ t: 'Q', c, p: [x, y] });
        nextQ = c;
        break;
      }
      case 'T': {
        const c: Pt = lastQ ? [2 * x - lastQ[0], 2 * y - lastQ[1]] : [x, y];
        x = ox + n();
        y = oy + n();
        segs.push({ t: 'Q', c, p: [x, y] });
        nextQ = c;
        break;
      }
      case 'A': {
        const rx = n();
        const ry = n();
        const rot = n();
        const large = n();
        const sweep = n();
        if ((large !== 0 && large !== 1) || (sweep !== 0 && sweep !== 1)) {
          throw new Error(`Arc flags must be 0 or 1 in ${d}`);
        }
        x = ox + n();
        y = oy + n();
        segs.push({ t: 'A', rx, ry, rot, large, sweep, p: [x, y] });
        break;
      }
      case 'Z':
        x = sx;
        y = sy;
        segs.push({ t: 'Z' });
        break;
      default:
        throw new Error(`Unsupported command ${cmd} in ${d}`);
    }
    lastC = nextC;
    lastQ = nextQ;
  }
  return segs;
}

const near = (a: number, b: number, eps = 0.02): boolean => Math.abs(a - b) <= eps;
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const len = (a: Pt): number => Math.hypot(a[0], a[1]);
const unit = (a: Pt): Pt => {
  const l = len(a);
  return l ? [a[0] / l, a[1] / l] : [0, 0];
};
const dot = (a: Pt, b: Pt): number => a[0] * b[0] + a[1] * b[1];

interface Corner {
  /** Index of the arc segment. */
  at: number;
  start: Pt;
  end: Pt;
  corner: Pt;
  r: number;
  prev: number | null;
  next: number | null;
  /** Index of the subpath's M. */
  m: number;
}

/** Split into subpaths: [startIndex, endIndexExclusive] over segs, each beginning with M. */
function subpaths(segs: Seg[]): [number, number][] {
  const out: [number, number][] = [];
  let s = -1;
  segs.forEach((g, i) => {
    if (g.t === 'M') {
      if (s >= 0) out.push([s, i]);
      s = i;
    }
  });
  if (s >= 0) out.push([s, segs.length]);
  return out;
}

/** The point each segment starts from. */
function starts(segs: Seg[]): Pt[] {
  const out: Pt[] = [];
  let cur: Pt = [0, 0];
  let sub0: Pt = [0, 0];
  for (const g of segs) {
    out.push(cur);
    if (g.t === 'M') {
      cur = g.p;
      sub0 = g.p;
    } else if (g.t === 'Z') cur = sub0;
    else cur = g.p;
  }
  return out;
}

/** Apply continuous corners; returns new absolute segments. */
export function smoothCorners(input: Seg[]): Seg[] {
  const segs: Seg[] = input.map((g) => ({ ...g }));
  const from = starts(segs);
  const corners: Corner[] = [];

  for (const [s, e] of subpaths(segs)) {
    const m = segs[s] as Extract<Seg, { t: 'M' }>;
    const lastIdx = segs[e - 1]?.t === 'Z' ? e - 2 : e - 1;
    const last = segs[lastIdx];
    // Neighbours wrap around only when the last drawn segment really ends on the start point
    // (tabler closes outlines that way); an implicit Z line can't be shortened, so it doesn't count.
    const closed =
      last !== undefined &&
      last.t !== 'M' &&
      last.t !== 'Z' &&
      near(last.p[0], m.p[0]) &&
      near(last.p[1], m.p[1]);
    for (let i = s + 1; i <= lastIdx; i++) {
      const g = segs[i] as Seg;
      if (g.t !== 'A' || g.large !== 0 || !near(g.rx, g.ry) || g.rx > MAX_R) continue;
      const p0 = from[i] as Pt;
      const p1 = g.p;
      const r = g.rx;
      const dx = p1[0] - p0[0];
      const dy = p1[1] - p0[1];
      if (!near(Math.abs(dx), r, 0.03) || !near(Math.abs(dy), r, 0.03)) continue;
      // The centre is (p0.x, p1.y) or (p1.x, p0.y): the one turning the way the sweep flag says.
      const cands: Pt[] = [
        [p0[0], p1[1]],
        [p1[0], p0[1]],
      ];
      const want = g.sweep === 1 ? 1 : -1;
      const centre = cands.find((o) => {
        const a = sub(p0, o);
        const b = sub(p1, o);
        return Math.sign(a[0] * b[1] - a[1] * b[0]) === want;
      });
      if (!centre) continue;
      const corner = sub(add(p0, p1), centre);
      // straight neighbours, cyclic on closed subpaths
      let prev: number | null = i - 1 > s ? i - 1 : closed ? lastIdx : null;
      let next: number | null = i + 1 <= lastIdx ? i + 1 : closed ? s + 1 : null;
      if (prev === i) prev = null;
      if (next === i) next = null;
      corners.push({ at: i, start: p0, end: p1, corner, r, prev, next, m: s });
    }
  }
  if (!corners.length) return segs;

  // Decide every extension against the original geometry before editing anything.
  const lineLen = (idx: number | null): number => {
    if (idx === null) return 0;
    const g = segs[idx];
    if (!g || g.t !== 'L') return 0;
    return len(sub(g.p, from[idx] as Pt));
  };
  const plans = corners.map((c) => {
    const inDir = unit(sub(c.corner, c.start));
    const outDir = unit(sub(c.end, c.corner));
    const prevSeg = c.prev === null ? null : segs[c.prev];
    const nextSeg = c.next === null ? null : segs[c.next];
    const prevOk =
      prevSeg?.t === 'L' && dot(unit(sub(prevSeg.p, from[c.prev as number] as Pt)), inDir) > 0.999;
    const nextOk =
      nextSeg?.t === 'L' && dot(unit(sub(nextSeg.p, from[c.next as number] as Pt)), outDir) > 0.999;
    const room = Math.min(prevOk ? lineLen(c.prev) * 0.45 : 0, nextOk ? lineLen(c.next) * 0.45 : 0);
    const ext = Math.max(0, Math.min(SMOOTHING * c.r, room));
    const d = c.r + ext;
    // Keep the corner's depth on the diagonal: circle inset r(√2−1) equals the cubic's d(4−3k)√2/8.
    const k = (4 - (8 * (Math.SQRT2 - 1) * c.r) / (Math.SQRT2 * d)) / 3;
    const a0 = add(c.corner, mul(inDir, -d));
    const a1 = add(c.corner, mul(outDir, d));
    return { c, ext, a0, a1, k };
  });

  for (const { c, ext, a0, a1, k } of plans) {
    const c1 = add(a0, mul(sub(c.corner, a0), k));
    const c2 = add(a1, mul(sub(c.corner, a1), k));
    segs[c.at] = { t: 'C', c1, c2, p: a1 };
    if (ext > 0) {
      // the incoming line now ends where the curve begins…
      segs[c.prev as number] = { t: 'L', p: a0 };
      // …and on a closed outline the start point moves with whichever corner it sits on
      if (c.at === c.m + 1) segs[c.m] = { t: 'M', p: a0 };
      else if (c.next === c.m + 1) segs[c.m] = { t: 'M', p: a1 };
    }
  }
  return segs;
}

const r3 = (v: number): string => {
  const s = (Math.round(v * 1000) / 1000).toString();
  if (s === '-0') return '0';
  return s.startsWith('0.') ? s.slice(1) : s.startsWith('-0.') ? `-${s.slice(2)}` : s;
};

/** Join numbers compactly: a minus sign or a leading dot after a decimal needs no space. */
function nums(values: number[]): string {
  let out = '';
  let prev = '';
  for (const v of values) {
    const s = r3(v);
    if (!out) out = s;
    else if (s.startsWith('-') || (s.startsWith('.') && prev.includes('.'))) out += s;
    else out += ` ${s}`;
    prev = s;
  }
  return out;
}

/** Serialise absolute segments as compact relative path data. */
export function serialize(segs: Seg[]): string {
  let out = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let first = true;
  for (const g of segs) {
    if (g.t === 'M') {
      out += first ? `M${nums([g.p[0], g.p[1]])}` : `m${nums([g.p[0] - x, g.p[1] - y])}`;
      first = false;
      [x, y] = g.p;
      [sx, sy] = g.p;
    } else if (g.t === 'Z') {
      out += 'z';
      x = sx;
      y = sy;
    } else if (g.t === 'L') {
      const dx = g.p[0] - x;
      const dy = g.p[1] - y;
      if (near(dy, 0, 0.0005)) out += `h${nums([dx])}`;
      else if (near(dx, 0, 0.0005)) out += `v${nums([dy])}`;
      else out += `l${nums([dx, dy])}`;
      [x, y] = g.p;
    } else if (g.t === 'C') {
      out += `c${nums([g.c1[0] - x, g.c1[1] - y, g.c2[0] - x, g.c2[1] - y, g.p[0] - x, g.p[1] - y])}`;
      [x, y] = g.p;
    } else if (g.t === 'Q') {
      out += `q${nums([g.c[0] - x, g.c[1] - y, g.p[0] - x, g.p[1] - y])}`;
      [x, y] = g.p;
    } else {
      out += `a${nums([g.rx, g.ry, g.rot])} ${g.large} ${g.sweep} ${nums([g.p[0] - x, g.p[1] - y])}`;
      [x, y] = g.p;
    }
  }
  return out;
}

/** Parse, smooth and re-serialise one path. */
export function hanjiPath(d: string): string {
  return serialize(smoothCorners(parse(d)));
}

/** The end point of every subpath, for tests. */
export function endpoints(d: string): Pt[] {
  const segs = parse(d);
  const pts: Pt[] = [];
  for (const g of segs) if (g.t !== 'Z') pts.push(g.p);
  return pts;
}
