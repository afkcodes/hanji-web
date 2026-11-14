'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';
import { artworkShapes } from './generate.ts';
import type { ArtShape } from './generate.ts';

const SizeContext = React.createContext<number | null>(null);

function toElement([tag, attrs, children]: ArtShape, key: number): React.ReactElement {
  const props: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(attrs)) {
    props[k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  }
  return React.createElement(tag, { key, ...props }, children?.map(toElement));
}

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /** Side in px. Default `--hj-artwork-size`, else 48. */
  size?: number;
  /** squircle (covers, playlists) or round (artists, stations). @default 'squircle' */
  shape?: 'squircle' | 'round';
  /** A soft drop so the cover reads as an object — the one shadow hanji allows, for art only. */
  lift?: boolean;
  /** Shorthand: draw the generated art for this id when Root has no children. */
  id?: string;
  render?: useRender.RenderProp;
}
export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'id'> {
  className?: string;
}

/**
 * The cover box: a squircle (or circle) that clips whatever art sits inside — generated art, a
 * collage, a glyph cover or a real image.
 *
 * @example
 * <Artwork.Root id="Late Night Drive" size={56} lift />
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    { size, shape = 'squircle', lift, id, render, className, style, children, ...rest },
  ] = useSlot('Artwork.Root', props);
  const sized = React.useMemo(
    () => (size === undefined ? style : { ['--_s' as string]: `${size}px`, ...style }),
    [size, style],
  );
  const element = useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      'data-shape': shape,
      'data-lift': flag(lift),
      style: sized,
      className: cls(config, 'Artwork.Root', 'hj-artwork', className) as string | undefined,
      children: children ?? (id !== undefined ? <Art id={id} /> : null),
    },
  });
  return <SizeContext.Provider value={size ?? null}>{element}</SizeContext.Provider>;
}

export interface ArtOwnProps {
  /** Any string — a title, an id. The same id always gets the same face. */
  id?: string;
  /** A face by number, 0–99 (composition × 10 + palette), for galleries and pickers. */
  face?: number;
  /** Crop to fill a box that isn't square (collage cells, banners). @default true */
  slice?: boolean;
}
export interface ArtProps extends ArtOwnProps, Omit<React.SVGProps<SVGSVGElement>, 'id'> {}

/**
 * Generated art: ten palettes × ten compositions, chosen by hashing `id`, with hanji's paper
 * fibres over the print. Decorative — the row around it carries the name.
 */
export function Art(props: ArtProps): React.ReactElement {
  const [config, { id, face, slice = true, className, ...rest }] = useSlot('Artwork.Art', props);
  const key = face ?? id ?? '';
  const shapes = React.useMemo(() => artworkShapes(key).map(toElement), [key]);
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMid meet'}
      aria-hidden="true"
      focusable="false"
      {...rest}
      className={cls(config, 'Artwork.Art', 'hj-artwork-art', className) as string | undefined}
    >
      {shapes}
    </svg>
  );
}

/** Cells as [left, top, width, height] fractions: full · halves · half + quarters · quarters. */
const PLANS: Readonly<Record<number, readonly (readonly [number, number, number, number])[]>> = {
  1: [[0, 0, 1, 1]],
  2: [
    [0, 0, 0.5, 1],
    [0.5, 0, 0.5, 1],
  ],
  3: [
    [0, 0, 0.5, 1],
    [0.5, 0, 0.5, 0.5],
    [0.5, 0.5, 0.5, 0.5],
  ],
  4: [
    [0, 0, 0.5, 0.5],
    [0.5, 0, 0.5, 0.5],
    [0, 0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5, 0.5],
  ],
};
const cellStyles = new Map<string, React.CSSProperties>();
function cellStyle(c: readonly [number, number, number, number]): React.CSSProperties {
  const k = c.join(',');
  let s = cellStyles.get(k);
  if (!s) {
    s = {
      left: `${c[0] * 100}%`,
      top: `${c[1] * 100}%`,
      width: `${c[2] * 100}%`,
      height: `${c[3] * 100}%`,
    };
    cellStyles.set(k, s);
  }
  return s;
}

export interface CollageOwnProps {
  /** The first covers inside the collection; four at most are drawn. */
  ids: readonly string[];
  /** Drawn whole when `ids` is empty, so an empty playlist is never a hole. */
  fallback?: string;
}
export interface CollageProps
  extends CollageOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'children'> {
  className?: string;
}

/**
 * A playlist cover made from the first covers inside it: full, halves, a half and two quarters,
 * or quarters. Cells tile the box exactly; the first tile leads.
 */
export function Collage(props: CollageProps): React.ReactElement {
  const [config, { ids, fallback, className, ...rest }] = useSlot('Artwork.Collage', props);
  const styled = !config.unstyled;
  const tiles = Math.min(4, ids.length);
  return (
    <span
      {...rest}
      data-tiles={tiles}
      className={
        cls(config, 'Artwork.Collage', 'hj-artwork-collage', className) as string | undefined
      }
    >
      {tiles === 0 ? (
        <Art id={fallback ?? 'empty collage'} />
      ) : (
        (PLANS[tiles] ?? []).map((c, i) => (
          <span
            // oxlint-disable-next-line react/no-array-index-key -- cells are positional
            key={i}
            className={styled ? 'hj-artwork-cell' : undefined}
            style={cellStyle(c)}
          >
            <Art id={ids[i] as string} />
          </span>
        ))
      )}
    </span>
  );
}

export interface GlyphOwnProps {
  /** Seeds the wash behind the glyph. */
  id: string;
  /** The glyph — any icon element. Sized for the box: 16 · 20 · 24 · 28. */
  children: React.ReactNode;
}
export interface GlyphProps
  extends GlyphOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'id' | 'children'> {
  className?: string;
}

/** Glyph size steps for the box: 48 · 72 · 120 px. */
const glyphFor = (box: number | null): number =>
  box === null ? 20 : box >= 120 ? 28 : box >= 72 ? 24 : box >= 48 ? 20 : 16;

/**
 * A cover for things with no art by construction — a folder, a category, a smart list: a
 * generated wash, a flat scrim and one glyph. Art alone says “we couldn’t read the image”; a glyph
 * cover says “there is nothing to read”.
 */
export function Glyph(props: GlyphProps): React.ReactElement {
  const [config, { id, children, className, style, ...rest }] = useSlot('Artwork.Glyph', props);
  const box = React.useContext(SizeContext);
  const styled = !config.unstyled;
  const sized = React.useMemo(
    () => ({ ['--_g' as string]: `${glyphFor(box)}px`, ...style }),
    [box, style],
  );
  return (
    <span
      {...rest}
      style={sized}
      className={cls(config, 'Artwork.Glyph', 'hj-artwork-glyph', className) as string | undefined}
    >
      <Art id={id} />
      <span className={styled ? 'hj-artwork-scrim' : undefined} />
      <span className={styled ? 'hj-artwork-mark' : undefined}>{children}</span>
    </span>
  );
}

export interface ImageOwnProps {
  src: string;
  /** Empty for decorative covers whose row already says the name. */
  alt: string;
  /** Generated art shown instead when the image is slow (over 400 ms) or fails. */
  id: string;
}
export interface ImageProps
  extends ImageOwnProps, Omit<React.ComponentProps<'img'>, 'className' | 'src' | 'alt' | 'id'> {
  className?: string;
}

/**
 * A real cover with generated art standing in — never under it: the art appears only if the
 * image is slow or fails, so a fast image never flashes a painted placeholder.
 */
export function Image(props: ImageProps): React.ReactElement {
  const [config, { src, alt, id, className, onLoad, onError, ...rest }] = useSlot(
    'Artwork.Image',
    props,
  );
  const [state, setState] = React.useState<'loading' | 'slow' | 'loaded' | 'failed'>('loading');
  const [seen, setSeen] = React.useState(src);
  if (seen !== src) {
    setSeen(src);
    setState('loading');
  }
  React.useEffect(() => {
    if (state !== 'loading') return;
    const t = window.setTimeout(() => setState((s) => (s === 'loading' ? 'slow' : s)), 400);
    return () => window.clearTimeout(t);
  }, [state]);
  return (
    <>
      {state === 'slow' || state === 'failed' ? <Art id={id} /> : null}
      {state === 'failed' ? null : (
        <img
          {...rest}
          src={src}
          alt={alt}
          data-state={state}
          onLoad={(e) => {
            onLoad?.(e);
            setState('loaded');
          }}
          onError={(e) => {
            onError?.(e);
            setState('failed');
          }}
          className={
            cls(config, 'Artwork.Image', 'hj-artwork-image', className) as string | undefined
          }
        />
      )}
    </>
  );
}
