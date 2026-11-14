/**
 * hanji's generated artwork: a painted stand-in for anything with no image. Ten palettes and ten
 * compositions make 100 faces; an id hashes to one of them (FNV-1a → fmix32, three salts), and a
 * seed varies the placement, so a subject never changes its face. Pure, flat SVG — at most ~25
 * shapes, no filters, no gradients — cheap enough for long lists.
 */

export interface ArtworkPalette {
  readonly name: string;
  readonly deep: string;
  readonly mid: string;
  readonly bright: string;
}

/** Ten pigments, each a deep ground, a mid and a bright. */
export const artworkPalettes: readonly ArtworkPalette[] = [
  { name: 'ember', deep: '#2b0f0a', mid: '#7a2417', bright: '#e2653a' },
  { name: 'iris', deep: '#120b2e', mid: '#3a2b8c', bright: '#8e7bf0' },
  { name: 'moss', deep: '#0a1a12', mid: '#1e5240', bright: '#6fcf97' },
  { name: 'rose', deep: '#2a0a1c', mid: '#8a2452', bright: '#f58bb0' },
  { name: 'azure', deep: '#04182b', mid: '#14567f', bright: '#62c4e8' },
  { name: 'amber', deep: '#241305', mid: '#8a5a0e', bright: '#f2b33d' },
  { name: 'teal', deep: '#041d1e', mid: '#10585c', bright: '#4fd1c5' },
  { name: 'cobalt', deep: '#060c2c', mid: '#23368f', bright: '#6e8cf5' },
  { name: 'violet', deep: '#1b0a24', mid: '#5b2287', bright: '#c083e8' },
  { name: 'clay', deep: '#201510', mid: '#6e4632', bright: '#d9a17a' },
];

// ---------- hashing ----------

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, 0x01000193);
    const high = input.charCodeAt(i) >>> 8;
    if (high !== 0) {
      hash ^= high;
      hash = Math.imul(hash, 0x01000193);
    }
  }
  return hash >>> 0;
}
function fmix32(input: number): number {
  let h = input;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
const channel = (salt: string, id: string): number => fmix32(fnv1a(`${salt}:${id}`));
/** A stable integer in [0, n) for one channel of a seed. */
const pick = (seed: number, ch: number, n: number): number =>
  n > 0 ? channel(`v${ch}`, String(seed)) % Math.trunc(n) : 0;

// ---------- shapes ----------

/** A shape: tag, attributes, children. Rendered as React elements or as an SVG string. */
export type ArtShape = readonly [
  tag: 'rect' | 'circle' | 'path' | 'polygon' | 'g',
  attrs: Readonly<Record<string, string | number>>,
  children?: readonly ArtShape[],
];

const BOX = 100;
const n2 = (v: number): number => Math.round(v * 100) / 100;
const C = (cx: number, cy: number, r: number, fill: string, opacity?: number): ArtShape => [
  'circle',
  { cx: n2(cx), cy: n2(cy), r: n2(r), fill, ...(opacity === undefined ? {} : { opacity }) },
];
const R = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  opacity?: number,
  rx?: number,
): ArtShape => [
  'rect',
  {
    x: n2(x),
    y: n2(y),
    width: n2(w),
    height: n2(h),
    fill,
    ...(opacity === undefined ? {} : { opacity }),
    ...(rx ? { rx } : {}),
  },
];
const P = (d: string, fill: string, opacity?: number): ArtShape => [
  'path',
  { d, fill, ...(opacity === undefined ? {} : { opacity }) },
];

type Composition = (p: ArtworkPalette, s: number) => ArtShape[];

const compositions: readonly (readonly [string, Composition])[] = [
  [
    'rings',
    (p, s) => {
      const cx = 30 + pick(s, 1, 40);
      const cy = 28 + pick(s, 2, 44);
      return [C(cx, cy, 46, p.mid, 0.75), C(cx, cy, 30, p.deep), C(cx, cy, 15, p.bright)];
    },
  ],
  [
    'bands',
    (p, s) => {
      const sh = pick(s, 1, 30);
      return [
        [
          'g',
          { transform: 'rotate(-28 50 50)' },
          [
            R(-60, -20 + sh, 220, 26, p.mid),
            R(-60, 26 + sh, 220, 12, p.bright),
            R(-60, 58 + sh, 220, 20, p.mid, 0.6),
          ],
        ],
      ];
    },
  ],
  [
    'dots',
    (p, s) => {
      const cells = 4 + pick(s, 1, 2);
      const step = BOX / cells;
      const out: ArtShape[] = [];
      for (let y = 0; y < cells; y++) {
        for (let x = 0; x < cells; x++) {
          const big = pick(s, y * cells + x + 2, 3) > 0;
          out.push(
            C(
              step * (x + 0.5),
              step * (y + 0.5),
              big ? step * 0.36 : step * 0.18,
              (x + y) % 2 === 0 ? p.bright : p.mid,
            ),
          );
        }
      }
      return out;
    },
  ],
  [
    'orbs',
    (p, s) => {
      const d = 18 + pick(s, 1, 22);
      return [C(50 - d / 2, 44, 34, p.mid), C(50 + d / 2, 60, 30, p.bright, 0.82)];
    },
  ],
  [
    'stripes',
    (p, s) => {
      const out: ArtShape[] = [];
      let y = 0;
      for (let i = 0; y < BOX; i++) {
        const h = 6 + pick(s, i + 1, 16);
        out.push(
          R(
            0,
            y,
            BOX,
            Math.min(h, BOX - y),
            i % 3 === 0 ? p.bright : p.mid,
            i % 3 === 1 ? 0.55 : undefined,
          ),
        );
        y += h + 4;
      }
      return out;
    },
  ],
  [
    'arcs',
    (p, s) => {
      const r = 52 + pick(s, 1, 26);
      return [
        P(`M0 0H${r}A${r} ${r} 0 0 1 0 ${r}Z`, p.mid),
        P(`M${BOX} ${BOX}H${BOX - r}A${r} ${r} 0 0 1 ${BOX} ${BOX - r}Z`, p.bright),
      ];
    },
  ],
  [
    'wedge',
    (p, s) => {
      const a = 20 + pick(s, 1, 60);
      return [
        ['polygon', { points: `0,${BOX} ${a},0 ${BOX},${BOX}`, fill: p.mid }],
        [
          'polygon',
          { points: `${a},0 ${BOX},${BOX} ${BOX},${BOX * 0.45}`, fill: p.bright, opacity: 0.85 },
        ],
      ];
    },
  ],
  [
    'nested',
    (p, s) => {
      const ang = 8 + pick(s, 1, 30);
      return [
        [
          'g',
          { transform: `rotate(${ang} 50 50)` },
          [
            R(12, 12, 76, 76, p.mid, undefined, 10),
            R(26, 26, 48, 48, p.deep, undefined, 8),
            R(38, 38, 24, 24, p.bright, undefined, 6),
          ],
        ],
      ];
    },
  ],
  [
    'horizon',
    (p, s) => {
      const cx = 28 + pick(s, 1, 44);
      const r = 17 + pick(s, 2, 10);
      const line = 58 + pick(s, 3, 8);
      return [
        C(cx, line, r, p.bright),
        R(0, line, BOX, BOX - line, p.mid),
        R(cx - r * 0.9, line + 8, r * 1.8, 2.5, p.bright, 0.55, 1.25),
        R(cx - r * 0.6, line + 15, r * 1.2, 2.5, p.bright, 0.4, 1.25),
        R(cx - r * 0.32, line + 22, r * 0.64, 2.5, p.bright, 0.28, 1.25),
      ];
    },
  ],
  [
    'hills',
    (p, s) => {
      const a = pick(s, 1, 24);
      const b = pick(s, 2, 24);
      const moon = 58 + pick(s, 3, 28);
      return [
        C(moon, 24 + pick(s, 4, 10), 7 + pick(s, 5, 4), p.bright, 0.9),
        P(
          `M0 ${60 + b / 4}Q${24 + a} ${38} ${56} ${56}T${BOX} ${48 + a / 4}V${BOX}H0Z`,
          p.mid,
          0.55,
        ),
        P(`M0 ${74}Q${36 + b} ${52 + a / 3} ${70} ${70}T${BOX} ${64}V${BOX}H0Z`, p.mid),
        P(
          `M0 ${88 - a / 6}Q${28 + a / 2} ${70} ${60} ${84}T${BOX} ${80 - b / 6}V${BOX}H0Z`,
          p.bright,
          0.92,
        ),
      ];
    },
  ],
];

/** The ten compositions, in face order. */
export const artworkCompositions: readonly string[] = compositions.map(([name]) => name);

/** Ten palettes × ten compositions. */
export const ARTWORK_FACES: number = artworkPalettes.length * compositions.length;

export interface ArtworkSpec {
  /** 0–99: composition × 10 + palette. */
  readonly face: number;
  readonly palette: ArtworkPalette;
  readonly composition: string;
  readonly seed: number;
}

/**
 * Which face an id gets. A string hashes to a face and a seed; a number 0–99 names a face
 * directly (with its own fixed seed), for galleries and pickers.
 */
export function artworkSpec(idOrFace: string | number): ArtworkSpec {
  let comp: number;
  let pal: number;
  let seed: number;
  if (typeof idOrFace === 'number') {
    const face = ((Math.trunc(idOrFace) % ARTWORK_FACES) + ARTWORK_FACES) % ARTWORK_FACES;
    comp = Math.floor(face / artworkPalettes.length);
    pal = face % artworkPalettes.length;
    seed = channel('s', `face-${face}`);
  } else {
    comp = channel('c', idOrFace) % compositions.length;
    pal = channel('p', idOrFace) % artworkPalettes.length;
    seed = channel('s', idOrFace);
  }
  return {
    face: comp * artworkPalettes.length + pal,
    palette: artworkPalettes[pal] as ArtworkPalette,
    composition: (compositions[comp] as readonly [string, Composition])[0],
    seed,
  };
}

/**
 * hanji's paper: a few long mulberry fibres over the print, as one faint path. Seeded, so each
 * face keeps its own fibres.
 */
function fibres(seed: number): ArtShape {
  let d = '';
  for (let i = 0; i < 14; i++) {
    const x = pick(seed, 40 + i * 5, 100);
    const y = pick(seed, 41 + i * 5, 100);
    const len = 14 + pick(seed, 42 + i * 5, 40);
    const a = (pick(seed, 43 + i * 5, 180) * Math.PI) / 180;
    const bend = pick(seed, 44 + i * 5, 12) - 6;
    const dx = Math.cos(a) * len;
    const dy = Math.sin(a) * len;
    d += `M${n2(x)} ${n2(y)}q${n2(dx / 2 - (dy / len) * bend)} ${n2(dy / 2 + (dx / len) * bend)} ${n2(dx)} ${n2(dy)}`;
  }
  return [
    'path',
    {
      d,
      fill: 'none',
      stroke: '#fff',
      'stroke-width': 0.35,
      'stroke-linecap': 'round',
      opacity: 0.09,
    },
  ];
}

/** The shapes for an id or face, ground first, paper fibres last. */
export function artworkShapes(idOrFace: string | number): ArtShape[] {
  const spec = artworkSpec(idOrFace);
  const draw = (
    compositions.find(([n]) => n === spec.composition) as readonly [string, Composition]
  )[1];
  return [
    R(0, 0, BOX, BOX, spec.palette.deep),
    ...draw(spec.palette, spec.seed),
    fibres(spec.seed),
  ];
}

function shapeToString([tag, attrs, children]: ArtShape): string {
  const a = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
  return children
    ? `<${tag}${a}>${children.map(shapeToString).join('')}</${tag}>`
    : `<${tag}${a}/>`;
}

/**
 * The artwork as a standalone SVG string — for <img> data URLs, canvases, emails or another
 * framework. `slice` crops instead of letterboxing when the box isn't square.
 */
export function artworkSvg(
  idOrFace: string | number,
  options: { size?: number; slice?: boolean } = {},
): string {
  const dim = options.size ? ` width="${options.size}" height="${options.size}"` : '';
  const fit = options.slice ? 'xMidYMid slice' : 'xMidYMid meet';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}"${dim} preserveAspectRatio="${fit}" aria-hidden="true">${artworkShapes(idOrFace).map(shapeToString).join('')}</svg>`;
}
