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
/** Rounded corners drawn as curves (a squircle already) grow by this much: hanji is a bit rounder. */
export const GROW = 1.3;
/** Largest curve corner (run-in from the corner point) that is still a "corner", not a shape. */
export const MAX_CURVE_CORNER = 5.5;
/** Handle length of a grown corner, as a share of its run-in: a soft squircle. */
const CURVE_K = 0.74;

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
  /** Index of the first segment of the corner (an arc, or a run of curves). */
  at: number;
  /** Index of the corner's last segment (= at for an arc). */
  until: number;
  kind: 'arc' | 'curve';
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
      corners.push({
        at: i,
        until: i,
        kind: 'arc',
        start: p0,
        end: p1,
        corner,
        r,
        prev,
        next,
        m: s,
      });
    }
    // Rounded corners drawn as one to three curves between two straight edges at a right angle.
    for (let i = s + 1; i <= lastIdx; i++) {
      if (segs[i]?.t !== 'C') continue;
      const prevIdx = i - 1 > s ? i - 1 : closed ? lastIdx : null;
      if (prevIdx === null || segs[prevIdx]?.t !== 'L') continue;
      let j = i;
      while (j + 1 <= lastIdx && segs[j + 1]?.t === 'C' && j - i < 2) j++;
      const nextIdx = j + 1 <= lastIdx ? j + 1 : closed ? s + 1 : null;
      if (nextIdx === null || segs[nextIdx]?.t !== 'L' || nextIdx === prevIdx) continue;
      const first = segs[i] as Extract<Seg, { t: 'C' }>;
      const lastC = segs[j] as Extract<Seg, { t: 'C' }>;
      const p0 = from[i] as Pt;
      const p1 = lastC.p;
      const lineIn = segs[prevIdx] as Extract<Seg, { t: 'L' }>;
      const lineOut = segs[nextIdx] as Extract<Seg, { t: 'L' }>;
      const u = unit(sub(lineIn.p, from[prevIdx] as Pt));
      const v = unit(sub(lineOut.p, from[nextIdx] as Pt));
      if (Math.abs(dot(u, v)) > 0.06) continue;
      const t0 = sub(first.c1, p0);
      const t1 = sub(p1, lastC.c2);
      if (len(t0) < 1e-6 || len(t1) < 1e-6) continue;
      if (dot(unit(t0), u) < 0.98 || dot(unit(t1), v) < 0.98) continue;
      const along = dot(sub(p1, p0), u);
      const corner = add(p0, mul(u, along));
      const a = along;
      const b = dot(sub(p1, corner), v);
      if (a <= 0.2 || b <= 0.2 || a > MAX_CURVE_CORNER || b > MAX_CURVE_CORNER) continue;
      if (Math.abs(a - b) > 0.35 * Math.max(a, b)) continue;
      if (Math.abs(len(sub(sub(p1, corner), mul(v, b)))) > 0.05) continue;
      corners.push({
        at: i,
        until: j,
        kind: 'curve',
        start: p0,
        end: p1,
        corner,
        r: (a + b) / 2,
        prev: prevIdx,
        next: nextIdx,
        m: s,
      });
      i = j;
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
    const ext = Math.max(0, Math.min((c.kind === 'arc' ? SMOOTHING : GROW - 1) * c.r, room));
    const d = c.r + ext;
    // Arcs keep the corner's depth on the diagonal (circle inset r(√2−1) = the cubic's
    // d(4−3k)√2/8); curve corners grow into a soft squircle.
    const k =
      c.kind === 'arc' ? (4 - (8 * (Math.SQRT2 - 1) * c.r) / (Math.SQRT2 * d)) / 3 : CURVE_K;
    const a0 = add(c.corner, mul(inDir, -d));
    const a1 = add(c.corner, mul(outDir, d));
    return { c, ext, a0, a1, k };
  });

  const drop = new Set<number>();
  for (const { c, ext, a0, a1, k } of plans) {
    const c1 = add(a0, mul(sub(c.corner, a0), k));
    const c2 = add(a1, mul(sub(c.corner, a1), k));
    segs[c.at] = { t: 'C', c1, c2, p: a1 };
    for (let x = c.at + 1; x <= c.until; x++) drop.add(x);
    if (ext > 0 || c.kind === 'curve') {
      // the incoming line now ends where the curve begins…
      segs[c.prev as number] = { t: 'L', p: a0 };
      // …and on a closed outline the start point moves with whichever corner it sits on
      if (c.at === c.m + 1) segs[c.m] = { t: 'M', p: a0 };
      else if (c.next === c.m + 1) segs[c.m] = { t: 'M', p: a1 };
    }
  }
  return drop.size ? segs.filter((_, i) => !drop.has(i)) : segs;
}

let precision = 3;
const fmt = (v: number): string => {
  const f = 10 ** precision;
  const s = (Math.round(v * f) / f).toString();
  if (s === '-0') return '0';
  return s.startsWith('0.') ? s.slice(1) : s.startsWith('-0.') ? `-${s.slice(2)}` : s;
};
const snap = (v: number): number => {
  const f = 10 ** precision;
  return Math.round(v * f) / f;
};

/** Join numbers compactly: a minus sign or a leading dot after a decimal needs no space. */
function nums(values: number[]): string {
  let out = '';
  let prev = '';
  for (const v of values) {
    const s = fmt(v);
    if (!out) out = s;
    else if (s.startsWith('-') || (s.startsWith('.') && prev.includes('.'))) out += s;
    else out += ` ${s}`;
    prev = s;
  }
  return out;
}

/**
 * Serialise absolute segments as compact relative path data. The cursor advances by the rounded
 * deltas, so rounding never accumulates: a closed outline still lands on its start.
 */
export function serialize(segs: Seg[], digits = 3): string {
  precision = digits;
  let out = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let first = true;
  const rel = (p: Pt): [number, number] => [snap(p[0] - x), snap(p[1] - y)];
  for (const g of segs) {
    if (g.t === 'M') {
      if (first) {
        out += `M${nums([g.p[0], g.p[1]])}`;
        x = snap(g.p[0]);
        y = snap(g.p[1]);
      } else {
        const [dx, dy] = rel(g.p);
        out += `m${nums([dx, dy])}`;
        x += dx;
        y += dy;
      }
      first = false;
      sx = x;
      sy = y;
    } else if (g.t === 'Z') {
      out += 'z';
      x = sx;
      y = sy;
    } else if (g.t === 'L') {
      const [dx, dy] = rel(g.p);
      // a zero-length segment is a dot (drawn by the round cap): keep it
      if (dy === 0) out += `h${nums([dx])}`;
      else if (dx === 0) out += `v${nums([dy])}`;
      else out += `l${nums([dx, dy])}`;
      x += dx;
      y += dy;
    } else if (g.t === 'C') {
      const [dx, dy] = rel(g.p);
      out += `c${nums([g.c1[0] - x, g.c1[1] - y, g.c2[0] - x, g.c2[1] - y, dx, dy])}`;
      x += dx;
      y += dy;
    } else if (g.t === 'Q') {
      const [dx, dy] = rel(g.p);
      out += `q${nums([g.c[0] - x, g.c[1] - y, dx, dy])}`;
      x += dx;
      y += dy;
    } else {
      const [dx, dy] = rel(g.p);
      out += `a${nums([g.rx, g.ry, g.rot])} ${g.large} ${g.sweep} ${nums([dx, dy])}`;
      x += dx;
      y += dy;
    }
  }
  return out;
}

/** Make an implicit Z line explicit, so the corners on either side of it can be rounded. */
export function closeExplicit(segs: Seg[]): Seg[] {
  const out: Seg[] = [];
  let start: Pt = [0, 0];
  let cur: Pt = [0, 0];
  for (const g of segs) {
    if (g.t === 'M') {
      start = g.p;
      cur = g.p;
    } else if (g.t === 'Z') {
      if (!near(cur[0], start[0], 0.001) || !near(cur[1], start[1], 0.001)) {
        out.push({ t: 'L', p: start });
      }
      cur = start;
    } else cur = g.p;
    out.push(g);
  }
  return out;
}

/**
 * Round every sharp vertex where two straight segments meet with a circular fillet of radius `r`
 * (drawn as a cubic). The fillet never takes more than 45% of either segment, so short segments
 * and neighbouring vertices keep their shape; near-straight and hairpin vertices are left alone.
 */
export function fillet(input: Seg[], r: number): Seg[] {
  if (r <= 0) return input;
  const out: Seg[] = [];
  for (const [s, e] of subpaths(input)) {
    const part = input.slice(s, e);
    const hasZ = part.at(-1)?.t === 'Z';
    const body = hasZ ? part.slice(0, -1) : part;
    const m = body[0] as Extract<Seg, { t: 'M' }>;
    const segs = body.slice(1);
    const pts: Pt[] = [m.p];
    for (const g of segs) pts.push((g as Exclude<Seg, { t: 'M' } | { t: 'Z' }>).p);
    const n = segs.length;
    const last = pts[n] as Pt;
    const cyclic = n > 2 && near(last[0], m.p[0], 0.001) && near(last[1], m.p[1], 0.001);
    const isLine = (i: number): boolean => segs[i]?.t === 'L';
    const segLen = (i: number): number => len(sub2(pts[i + 1] as Pt, pts[i] as Pt));
    // vertex k sits between segment k-1 (ending at pts[k]) and segment k (starting there)
    const plans = new Map<number, { a0: Pt; a1: Pt; c1: Pt; c2: Pt }>();
    const vertices: [number, number, number][] = []; // [vertexIndex, inSeg, outSeg]
    for (let k = 1; k < n; k++) vertices.push([k, k - 1, k]);
    if (cyclic) vertices.push([0, n - 1, 0]);
    for (const [k, a, b] of vertices) {
      if (!isLine(a) || !isLine(b)) continue;
      const p = pts[k === 0 ? 0 : k] as Pt;
      const from = pts[a] as Pt;
      const to = pts[b + 1] as Pt;
      const la = segLen(a);
      const lb = segLen(b);
      if (la < 1e-6 || lb < 1e-6) continue;
      const u = unit(sub2(p, from));
      const v = unit(sub2(to, p));
      const turn = Math.acos(Math.max(-1, Math.min(1, dot(u, v))));
      if (turn < (14 * Math.PI) / 180 || turn > (172 * Math.PI) / 180) continue;
      const half = Math.tan(turn / 2);
      const t = Math.min(r * half, la * 0.45, lb * 0.45);
      const rr = t / half;
      const h = (4 / 3) * Math.tan(turn / 4) * rr;
      const a0 = add(p, mul(u, -t));
      const a1 = add(p, mul(v, t));
      plans.set(k, { a0, a1, c1: add(a0, mul(u, h)), c2: add(a1, mul(v, -h)) });
    }
    const start = plans.get(0);
    out.push({ t: 'M', p: start ? start.a1 : m.p });
    segs.forEach((g, i) => {
      const endVertex = i + 1 === n ? (cyclic ? 0 : -1) : i + 1;
      const plan = plans.get(endVertex);
      if (plan && g.t === 'L') {
        out.push({ t: 'L', p: plan.a0 });
        out.push({ t: 'C', c1: plan.c1, c2: plan.c2, p: plan.a1 });
      } else out.push(g);
    });
    if (hasZ) out.push({ t: 'Z' });
  }
  return out;
}

const sub2 = sub;

export interface PathOptions {
  /** Fillet radius for sharp straight-to-straight vertices; 0 keeps them sharp. */
  fillet?: number;
  /** Decimal places in the output. */
  precision?: number;
}

/** Parse, apply hanji's geometry (continuous corners, softened vertices) and re-serialise. */
export function hanjiPath(d: string, options: PathOptions = {}): string {
  const segs = smoothCorners(closeExplicit(parse(d)));
  return serialize(fillet(segs, options.fillet ?? 0), options.precision ?? 3);
}

/** The end point of every subpath, for tests. */
export function endpoints(d: string): Pt[] {
  const segs = parse(d);
  const pts: Pt[] = [];
  for (const g of segs) if (g.t !== 'Z') pts.push(g.p);
  return pts;
}
