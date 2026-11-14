/**
 * hanji's own layer over the base set: familiar aliases, search words, and glyphs drawn for hanji
 * where the base has none (or only draws them with masks).
 */

/** f = fill, e = even-odd fill, s = stroke. */
export interface Node {
  kind: 'f' | 'e' | 's';
  d: string;
  /** Drawn in the second ink in the two-ink styles. */
  secondary: boolean;
  /** Stroke width when it isn't 1.5. */
  width?: number | undefined;
}
export type Drawing = Node[];

/** alias → base icon. Exported as extra names for the same drawing (IconChevronDown…). */
export const ALIASES: Readonly<Record<string, string>> = {
  'chevron-down': 'alt-arrow-down',
  'chevron-up': 'alt-arrow-up',
  'chevron-left': 'alt-arrow-left',
  'chevron-right': 'alt-arrow-right',
  x: 'close',
  plus: 'add',
  trash: 'trash-bin-trash',
  delete: 'trash-bin-trash',
  more: 'menu-dots',
  'more-vertical': 'menu-dots-vertical',
  menu: 'hamburger-menu',
  edit: 'pen',
  alert: 'danger-triangle',
  warning: 'danger-triangle',
  info: 'info-circle',
  'x-circle': 'close-circle',
  'check-circle-filled': 'check-circle',
  gear: 'settings',
  tool: 'wrench',
  mail: 'letter',
  notification: 'bell',
  person: 'user',
};

/** Search words added for a name word: typing any of them finds the icon. */
export const SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  add: ['plus', 'new', 'create'],
  close: ['x', 'cancel', 'dismiss', 'remove'],
  trash: ['delete', 'remove', 'bin', 'discard'],
  bin: ['delete', 'trash'],
  pen: ['edit', 'write', 'compose'],
  pencil: ['edit', 'write'],
  magnifer: ['search', 'find', 'zoom'],
  search: ['find', 'magnifier', 'lookup'],
  settings: ['gear', 'cog', 'preferences', 'options'],
  tuning: ['filter', 'adjust', 'sliders', 'controls'],
  bell: ['notification', 'alert', 'reminder'],
  letter: ['mail', 'email', 'envelope', 'message'],
  chat: ['message', 'conversation', 'comment'],
  user: ['person', 'profile', 'account'],
  users: ['people', 'team', 'group'],
  home: ['house', 'start', 'main'],
  heart: ['like', 'love', 'favourite', 'favorite'],
  star: ['favourite', 'favorite', 'rating', 'bookmark'],
  stars: ['sparkle', 'ai', 'magic', 'generate'],
  magic: ['ai', 'sparkle', 'wand'],
  danger: ['warning', 'alert', 'error'],
  info: ['information', 'help', 'about'],
  question: ['help', 'faq', 'support'],
  check: ['done', 'tick', 'success', 'confirm'],
  copy: ['duplicate', 'clone', 'clipboard'],
  paperclip: ['attach', 'attachment', 'file'],
  link: ['url', 'chain', 'hyperlink'],
  lock: ['secure', 'private', 'password', 'locked'],
  unlocked: ['open', 'unlock'],
  key: ['password', 'access', 'secret'],
  eye: ['view', 'show', 'visible', 'preview'],
  closed: ['hide', 'hidden', 'invisible'],
  download: ['save', 'export'],
  upload: ['import', 'send'],
  share: ['send', 'export'],
  refresh: ['reload', 'sync', 'retry'],
  restart: ['reload', 'retry'],
  history: ['recent', 'time', 'undo'],
  calendar: ['date', 'schedule', 'event'],
  clock: ['time', 'schedule'],
  alarm: ['time', 'reminder'],
  camera: ['photo', 'picture'],
  gallery: ['photo', 'image', 'picture'],
  play: ['start', 'media', 'video'],
  pause: ['media', 'stop'],
  stop: ['media', 'end', 'halt'],
  volume: ['sound', 'audio', 'speaker'],
  microphone: ['mic', 'record', 'voice', 'audio'],
  music: ['song', 'audio', 'note'],
  folder: ['directory', 'files'],
  file: ['document', 'page'],
  document: ['file', 'page'],
  cart: ['shopping', 'basket', 'buy'],
  bag: ['shopping', 'purchase'],
  card: ['credit', 'payment', 'bank'],
  wallet: ['money', 'payment'],
  dollar: ['money', 'price', 'currency'],
  chart: ['graph', 'analytics', 'statistics'],
  graph: ['chart', 'analytics'],
  map: ['location', 'navigation'],
  point: ['pin', 'location', 'marker'],
  global: ['world', 'globe', 'language', 'internet'],
  cloud: ['storage', 'sync', 'weather'],
  sun: ['light', 'day', 'brightness', 'weather'],
  moon: ['dark', 'night', 'theme'],
  logout: ['sign out', 'exit', 'leave'],
  login: ['sign in', 'enter'],
  hamburger: ['menu', 'navigation'],
  dots: ['more', 'menu', 'options', 'overflow'],
  arrow: ['direction', 'navigate'],
  alt: ['chevron', 'caret'],
  widget: ['apps', 'grid', 'dashboard'],
  code: ['developer', 'programming', 'source'],
  programming: ['code', 'developer'],
  wrench: ['tool', 'settings', 'repair', 'fix'],
  bookmark: ['save', 'favourite'],
  filter: ['funnel', 'sort'],
  sort: ['order', 'arrange'],
  phone: ['call', 'telephone', 'mobile'],
  smartphone: ['phone', 'mobile', 'device'],
  laptop: ['computer', 'device'],
  monitor: ['screen', 'display', 'desktop'],
  shield: ['security', 'protect', 'safe'],
  bug: ['issue', 'debug', 'error'],
  rocket: ['launch', 'deploy', 'fast'],
  gift: ['present', 'reward'],
  bolt: ['lightning', 'flash', 'power', 'fast'],
};

// ---------- drawn for hanji ----------

type Pt = readonly [number, number];
const P = (p: Pt): string => `${+p[0].toFixed(3)} ${+p[1].toFixed(3)}`;
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const cross = (a: Pt, b: Pt): number => a[0] * b[1] - a[1] * b[0];

/** An arc from `from` to `to` on the circle around `c`, turning through `via`'s side. */
function arc(c: Pt, r: number, from: Pt, to: Pt, large: 0 | 1): string {
  const a: Pt = [from[0] - c[0], from[1] - c[1]];
  const b: Pt = [to[0] - c[0], to[1] - c[1]];
  const sweep = cross(a, b) > 0 !== (large === 1) ? 1 : 0;
  return `A${r} ${r} 0 ${large} ${sweep} ${P(to)}`;
}

/**
 * A wrench at 45°: a round head with an open jaw, a straight handle with a round end. Built from
 * geometry so the line and solid drawings share one outline.
 */
function wrench(): string {
  const H: Pt = [15.25, 8.75]; // head centre
  const R = 5.25;
  const ax: Pt = [Math.SQRT1_2, -Math.SQRT1_2]; // towards the jaw
  const nx: Pt = [Math.SQRT1_2, Math.SQRT1_2];
  const w = 1.9; // half jaw
  const h = 1.75; // half handle
  const depth = 1.1; // jaw floor from the centre
  const len = 13.4; // centre to the handle's end
  const at = (along: number, side: number): Pt => add(add(H, mul(ax, along)), mul(nx, side));
  const sJ = Math.sqrt(R * R - w * w);
  const sK = Math.sqrt(R * R - h * h);
  const J1 = at(sJ, w);
  const J2 = at(sJ, -w);
  const B1 = at(depth, w);
  const B2 = at(depth, -w);
  const K1 = at(-sK, h);
  const K2 = at(-sK, -h);
  const E1 = at(-len, h);
  const E2 = at(-len, -h);
  const C = at(-len, 0);
  const tip = at(-len - h, 0);
  return [
    `M${P(J1)}`,
    `L${P(B1)}`,
    `L${P(B2)}`,
    `L${P(J2)}`,
    arc(H, R, J2, K2, 0),
    `L${P(E2)}`,
    arc(C, h, E2, tip, 0),
    arc(C, h, tip, E1, 0),
    `L${P(K1)}`,
    arc(H, R, K1, J1, 0),
    'Z',
  ].join('');
}

const lens = 'M11 2.75a8.25 8.25 0 1 1 0 16.5a8.25 8.25 0 0 1 0-16.5z';
const handle = 'M17.25 17.25L21 21';

export interface Original {
  name: string;
  category: string;
  tags: readonly string[];
  line: Drawing;
  solid: Drawing;
  duo?: Drawing;
  duoSolid?: Drawing;
}

export const ORIGINALS: readonly Original[] = [
  {
    name: 'search',
    category: 'Search',
    tags: ['magnifier', 'find', 'lookup', 'zoom'],
    line: [
      { kind: 's', d: lens, secondary: false },
      { kind: 's', d: handle, secondary: false },
    ],
    solid: [
      { kind: 'f', d: lens, secondary: false },
      { kind: 's', d: handle, secondary: false },
    ],
    duo: [
      { kind: 's', d: lens, secondary: false },
      { kind: 's', d: handle, secondary: true },
    ],
    duoSolid: [
      { kind: 'f', d: lens, secondary: true },
      { kind: 's', d: handle, secondary: false },
    ],
  },
  {
    name: 'wrench',
    category: 'Tools',
    tags: ['tool', 'spanner', 'repair', 'fix', 'settings'],
    line: [{ kind: 's', d: wrench(), secondary: false }],
    solid: [{ kind: 'f', d: wrench(), secondary: false }],
  },
];
