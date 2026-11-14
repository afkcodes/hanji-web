import * as React from 'react';

/** outline: 1.5 line · solid: filled drawing (or the bold line where none exists) · wash: line over a 16% fill. */
export type IconVariant = 'outline' | 'solid' | 'wash';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'stroke'> {
  /** @default 'outline' */
  variant?: IconVariant;
  /** Width and height; numbers are px. @default '1em' — the icon follows font-size. */
  size?: number | string;
  /**
   * Line width in 24-grid units. Default `var(--hj-icon-stroke, 1.5)` (and
   * `var(--hj-icon-stroke-bold, 2.25)` for bold solids), so an ancestor can retune every icon.
   */
  stroke?: number;
  /** Accessible name. Without it the icon is decorative and hidden from assistive tech. */
  label?: string;
  ref?: React.Ref<SVGSVGElement>;
}

export interface HanjiIcon {
  (props: IconProps): React.JSX.Element;
  displayName: string;
  /** The kebab-case name, e.g. `arrow-up`. */
  readonly iconName: string;
  /** The outline drawing (one path). */
  readonly outline: string;
  /** The solid drawing's paths, or null when the solid is the bold line. */
  readonly solid: readonly string[] | null;
}

const LINE: React.CSSProperties = { strokeWidth: 'var(--hj-icon-stroke, 1.5)' };
const BOLD: React.CSSProperties = { strokeWidth: 'var(--hj-icon-stroke-bold, 2.25)' };
const WASH_OPACITY = 0.16;

function fills(paths: readonly string[]): React.ReactNode {
  // oxlint-disable-next-line react/no-array-index-key -- a fixed drawing; paths never reorder
  return paths.map((d, i) => <path key={i} d={d} />);
}

/** Make an icon component from its drawings. Generated code calls this once per icon. */
export function icon(name: string, outline: string, solid: readonly string[] | null): HanjiIcon {
  function Icon({
    variant = 'outline',
    size = '1em',
    stroke,
    label,
    style,
    ref,
    ...rest
  }: IconProps): React.JSX.Element {
    const common = {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      width: size,
      height: size,
      focusable: 'false' as const,
      role: label ? 'img' : undefined,
      'aria-label': label,
      'aria-hidden': label ? undefined : true,
      'data-hj-icon': name,
      'data-variant': variant,
      ref,
      ...rest,
    };
    if (variant === 'solid' && solid) {
      return (
        <svg {...common} fill="currentColor" style={style}>
          {fills(solid)}
        </svg>
      );
    }
    const bold = variant === 'solid';
    const tuned = stroke === undefined ? (bold ? BOLD : LINE) : undefined;
    return (
      <svg
        {...common}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke ?? (bold ? 2.25 : 1.5)}
        strokeLinecap="round"
        strokeLinejoin="round"
        // oxlint-disable-next-line react-perf/jsx-no-new-object-as-prop -- merges only when a caller passes style too; the common path reuses one constant
        style={tuned ? (style ? { ...tuned, ...style } : tuned) : style}
      >
        {variant === 'wash' && solid ? (
          <g fill="currentColor" stroke="none" opacity={WASH_OPACITY}>
            {fills(solid)}
          </g>
        ) : null}
        <path d={outline} />
      </svg>
    );
  }
  const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
  return Object.assign(Icon, {
    displayName: `Icon${pascal}`,
    iconName: name,
    outline,
    solid,
  });
}

const svgPaths = (ds: readonly string[]): string => ds.map((d) => `<path d="${d}"/>`).join('');

/** The icon as a standalone SVG string — for files, CSS backgrounds or another framework. */
export function toSvg(i: HanjiIcon, variant: IconVariant = 'outline', size = 24): string {
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"`;
  if (variant === 'solid' && i.solid)
    return `${head} fill="currentColor">${svgPaths(i.solid)}</svg>`;
  const width = variant === 'solid' ? 2.25 : 1.5;
  const wash =
    variant === 'wash' && i.solid
      ? `<g fill="currentColor" stroke="none" opacity="${WASH_OPACITY}">${svgPaths(i.solid)}</g>`
      : '';
  return `${head} fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${wash}<path d="${i.outline}"/></svg>`;
}
