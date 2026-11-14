import * as React from 'react';

import { MOTION_HREF, motionCss } from './motion.ts';

/** outline: the line · solid: the filled drawing · wash: the line over its solid at 16%. */
export type IconVariant = 'outline' | 'solid' | 'wash';

/**
 * One-off motion, played on mount and again whenever `trigger` changes:
 * draw (the line inks itself in) · pop (arrives on a spring) · ring (swings, for bells) ·
 * shake (no) · spin (working; loops).
 */
export type IconAnimation = 'draw' | 'pop' | 'ring' | 'shake' | 'spin';

/**
 * One drawing: [code, path] pairs. code is `f` (fill), `e` (even-odd fill) or `s` (stroke, with
 * a width when it isn't 1.5).
 */
export type Drawing = readonly (readonly [string, string])[];

export interface IconDrawings {
  line: Drawing;
  solid: Drawing;
}

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'stroke'> {
  /** @default 'outline' */
  variant?: IconVariant;
  /**
   * A toggle's state, drawn as outline (false) or solid (true); changing it floods the shape
   * with ink on a spring. Use for like, bookmark, pin, star. Overrides `variant`.
   */
  active?: boolean;
  /** Motion to play on mount and whenever `trigger` changes. */
  animate?: IconAnimation;
  /** Replays `animate` when this value changes (a count, an id, a timestamp). */
  trigger?: unknown;
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
const WASH_OPACITY = 0.16;

const widthCache = new Map<string, React.CSSProperties>();
/** A stroke width other than 1.5, scaled with --hj-icon-stroke; cached so styles stay stable. */
function widthStyle(w: string, order?: number): React.CSSProperties {
  const key = order === undefined ? w : `${w}@${order}`;
  let s = widthCache.get(key);
  if (!s) {
    s = {
      ...(w ? { strokeWidth: `calc(${STROKE} * ${Number(w) / 1.5})` } : null),
      ...(order === undefined ? null : { ['--hj-icon-i' as string]: order }),
    };
    widthCache.set(key, s);
  }
  return s;
}

function marks(drawing: Drawing, draw = false): React.ReactNode[] {
  let order = 0;
  return drawing.map(([code, d], i) => {
    const kind = code[0];
    if (kind === 's') {
      const w = code.slice(1);
      // the draw animation staggers strokes by their order
      const style = draw ? widthStyle(w, order++) : w ? widthStyle(w) : undefined;
      return (
        // oxlint-disable-next-line react/no-array-index-key -- a fixed drawing; marks never reorder
        <path key={i} d={d} pathLength={draw ? 1 : undefined} style={style} />
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
      />
    );
  });
}

/** Counts changes of `value` after mount (adjusting state while rendering, as React documents). */
function useChanges(value: unknown): number {
  const [seen, setSeen] = React.useState(value);
  const [count, setCount] = React.useState(0);
  if (!Object.is(seen, value)) {
    setSeen(value);
    setCount(count + 1);
  }
  return count;
}

/** Make an icon component from its drawings. Generated code calls this once per icon. */
export function icon(name: string, drawings: IconDrawings): HanjiIcon {
  function Icon({
    variant = 'outline',
    active,
    animate,
    trigger,
    size = '1em',
    stroke,
    label,
    style,
    ref,
    ...rest
  }: IconProps): React.JSX.Element {
    const replays = useChanges(trigger);
    let body: React.ReactNode;
    if (active !== undefined) {
      body = (
        <g data-hj-fill={active ? 'on' : 'off'}>
          <g data-layer="line">{marks(drawings.line)}</g>
          <g data-layer="solid">{marks(drawings.solid)}</g>
        </g>
      );
    } else if (variant === 'solid') body = marks(drawings.solid);
    else if (variant === 'wash') {
      body = (
        <>
          <g opacity={WASH_OPACITY}>{marks(drawings.solid)}</g>
          {marks(drawings.line, animate === 'draw')}
        </>
      );
    } else body = marks(drawings.line, animate === 'draw');
    if (animate) {
      // a new key restarts the animation from the top
      body = (
        <g key={replays} data-hj-anim={animate}>
          {body}
        </g>
      );
    }
    const lineStyle = stroke === undefined ? LINE_STYLE : undefined;
    const svg = (
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
        data-variant={active === undefined ? variant : active ? 'solid' : 'outline'}
        ref={ref}
        {...rest}
        // oxlint-disable-next-line react-perf/jsx-no-new-object-as-prop -- merges only when a caller passes style too; the common path reuses one constant
        style={lineStyle ? (style ? { ...lineStyle, ...style } : lineStyle) : style}
      >
        {body}
      </svg>
    );
    if (animate === undefined && active === undefined) return svg;
    return (
      <>
        {/* React 19 hoists this to <head> once, however many icons animate */}
        <style href={MOTION_HREF} precedence="hanji">
          {motionCss}
        </style>
        {svg}
      </>
    );
  }
  const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
  return Object.assign(Icon, { displayName: `Icon${pascal}`, iconName: name, drawings });
}

function svgMarks(drawing: Drawing): string {
  return drawing
    .map(([code, d]) => {
      if (code[0] === 's') {
        const w = code.slice(1);
        return `<path d="${d}"${w ? ` stroke-width="${w}"` : ''}/>`;
      }
      const rule = code[0] === 'e' ? ' fill-rule="evenodd" clip-rule="evenodd"' : '';
      return `<path d="${d}" fill="currentColor" stroke="none"${rule}/>`;
    })
    .join('');
}

/** The icon as a standalone SVG string — for files, design tools or another framework. */
export function toSvg(i: HanjiIcon, variant: IconVariant = 'outline', size = 24): string {
  const { drawings: dr } = i;
  let body: string;
  if (variant === 'solid') body = svgMarks(dr.solid);
  else if (variant === 'wash') {
    body = `<g opacity="${WASH_OPACITY}">${svgMarks(dr.solid)}</g>${svgMarks(dr.line)}`;
  } else body = svgMarks(dr.line);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
