import * as React from 'react';

/**
 * outline: the line · solid: the filled drawing · wash: the line over its solid at 16% ·
 * duotone / duotone-solid: two inks — secondary marks in a 40% tint, or `--hj-icon-second`.
 */
export type IconVariant = 'outline' | 'solid' | 'wash' | 'duotone' | 'duotone-solid';

/**
 * One drawing: [code, path] pairs. code is `f` (fill), `e` (even-odd fill) or `s` (stroke, with
 * an optional width when it isn't 1.5), prefixed `~` for marks drawn in the second ink.
 */
export type Drawing = readonly (readonly [string, string])[];

/** A two-ink drawing, or the indices of the base drawing's marks that take the second ink. */
export type TwoInk = Drawing | readonly number[];

export interface IconDrawings {
  line: Drawing;
  solid: Drawing;
  duo: TwoInk;
  duoSolid: TwoInk;
}

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'stroke'> {
  /** @default 'outline' */
  variant?: IconVariant;
  /** Width and height; numbers are px. @default '1em' — the icon follows font-size. */
  size?: number | string;
  /** Line width in 24-grid units. Default `var(--hj-icon-stroke, 1.5)`, so an ancestor can retune every icon. */
  stroke?: number;
  /** Accessible name. Without it the icon is decorative and hidden from assistive tech. */
  label?: string;
  ref?: React.Ref<SVGSVGElement>;
}

export interface HanjiIcon {
  (props: IconProps): React.JSX.Element;
  displayName: string;
  /** The kebab-case name, e.g. `alt-arrow-down`. */
  readonly iconName: string;
  readonly drawings: IconDrawings;
}

const STROKE = 'var(--hj-icon-stroke, 1.5)';
const LINE_STYLE: React.CSSProperties = { strokeWidth: STROKE };
/**
 * The second ink: a 40% tint of the icon's colour by default; set `--hj-icon-second` (for example
 * to `var(--hj-accent)`) on any ancestor to ink the secondary marks in a colour of your own.
 */
const SECOND_STYLE: React.CSSProperties = {
  color: 'var(--hj-icon-second, color-mix(in srgb, currentColor 40%, transparent))',
};
const WASH_OPACITY = 0.16;

/** Expand a two-ink spec against its base drawing. */
export function twoInk(spec: TwoInk, base: Drawing): Drawing {
  if (spec.length && typeof spec[0] !== 'number') return spec as Drawing;
  const inked = new Set(spec as readonly number[]);
  return base.map(([code, d], i) =>
    inked.has(i) ? ([`~${code}`, d] as const) : ([code, d] as const),
  );
}

const widthCache = new Map<string, React.CSSProperties>();
/** A stroke width other than 1.5, scaled with --hj-icon-stroke; cached so styles stay stable. */
function widthStyle(w: string, second: boolean): React.CSSProperties {
  const key = second ? `~${w}` : w;
  let s = widthCache.get(key);
  if (!s) {
    s = { strokeWidth: `calc(${STROKE} * ${Number(w) / 1.5})`, ...(second ? SECOND_STYLE : null) };
    widthCache.set(key, s);
  }
  return s;
}

function marks(drawing: Drawing, inks: boolean): React.ReactNode[] {
  return drawing.map(([code, d], i) => {
    const second = code.startsWith('~');
    const c = second ? code.slice(1) : code;
    const kind = c[0];
    const style = inks && second ? SECOND_STYLE : undefined;
    if (kind === 's') {
      const w = c.slice(1);
      return (
        // oxlint-disable-next-line react/no-array-index-key -- a fixed drawing; marks never reorder
        <path key={i} d={d} style={w ? widthStyle(w, Boolean(style)) : style} />
      );
    }
    return (
      <path
        // oxlint-disable-next-line react/no-array-index-key -- a fixed drawing; marks never reorder
        key={i}
        d={d}
        fill="currentColor"
        stroke="none"
        fillRule={kind === 'e' ? 'evenodd' : undefined}
        clipRule={kind === 'e' ? 'evenodd' : undefined}
        style={style}
      />
    );
  });
}

/** Make an icon component from its drawings. Generated code calls this once per icon. */
export function icon(name: string, drawings: IconDrawings): HanjiIcon {
  function Icon({
    variant = 'outline',
    size = '1em',
    stroke,
    label,
    style,
    ref,
    ...rest
  }: IconProps): React.JSX.Element {
    let body: React.ReactNode;
    if (variant === 'solid') body = marks(drawings.solid, false);
    else if (variant === 'duotone') body = marks(twoInk(drawings.duo, drawings.line), true);
    else if (variant === 'duotone-solid') {
      body = marks(twoInk(drawings.duoSolid, drawings.solid), true);
    } else if (variant === 'wash') {
      body = (
        <>
          <g opacity={WASH_OPACITY}>{marks(drawings.solid, false)}</g>
          {marks(drawings.line, false)}
        </>
      );
    } else body = marks(drawings.line, false);
    const lineStyle = stroke === undefined ? LINE_STYLE : undefined;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke ?? 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        data-hj-icon={name}
        data-variant={variant}
        ref={ref}
        {...rest}
        // oxlint-disable-next-line react-perf/jsx-no-new-object-as-prop -- merges only when a caller passes style too; the common path reuses one constant
        style={lineStyle ? (style ? { ...lineStyle, ...style } : lineStyle) : style}
      >
        {body}
      </svg>
    );
  }
  const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
  return Object.assign(Icon, { displayName: `Icon${pascal}`, iconName: name, drawings });
}

function svgMarks(drawing: Drawing, inks: boolean): string {
  return drawing
    .map(([code, d]) => {
      const second = code.startsWith('~');
      const c = second ? code.slice(1) : code;
      const ink = inks && second ? ' opacity="0.5"' : '';
      if (c[0] === 's') {
        const w = c.slice(1);
        return `<path d="${d}"${w ? ` stroke-width="${w}"` : ''}${ink}/>`;
      }
      const rule = c[0] === 'e' ? ' fill-rule="evenodd" clip-rule="evenodd"' : '';
      return `<path d="${d}" fill="currentColor" stroke="none"${rule}${ink}/>`;
    })
    .join('');
}

/**
 * The icon as a standalone SVG string — for files, design tools or another framework. Two-ink
 * marks become 50% opacity, since a file can't read the theme's accent.
 */
export function toSvg(i: HanjiIcon, variant: IconVariant = 'outline', size = 24): string {
  const { drawings: dr } = i;
  let body: string;
  if (variant === 'solid') body = svgMarks(dr.solid, false);
  else if (variant === 'duotone') body = svgMarks(twoInk(dr.duo, dr.line), true);
  else if (variant === 'duotone-solid') body = svgMarks(twoInk(dr.duoSolid, dr.solid), true);
  else if (variant === 'wash') {
    body = `<g opacity="${WASH_OPACITY}">${svgMarks(dr.solid, false)}</g>${svgMarks(dr.line, false)}`;
  } else body = svgMarks(dr.line, false);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
