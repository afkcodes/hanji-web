import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  ArtOwnProps,
  CollageOwnProps,
  GlyphOwnProps,
  ImageOwnProps,
  RootOwnProps,
} from './artwork.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Artwork',
  slug: 'artwork',
  category: 'atoms',
  status: 'new',
  description:
    'Generated cover art for anything without an image: 100 faces (ten palettes × ten compositions) chosen by hashing an id, printed on hanji’s paper fibres. Plus collage covers, glyph covers and a real image with art standing in.',
  whenToUse: [
    'Albums, playlists, projects, documents or channels that have no image yet.',
    'A playlist cover made from the first covers inside it (Collage).',
    'Folders, categories and smart lists — things with no art by construction (Glyph).',
  ],
  whenNotToUse: [
    'People — use Avatar: initials on a tint read as a person, art does not.',
    'Decoration with no subject behind it: art stands in for a thing, it is not wallpaper.',
  ],
  import: "import { Artwork, artworkSvg, artworkSpec, ARTWORK_FACES } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'span',
      slot: 'Artwork.Root',
      className: 'hj-artwork',
      description:
        'The cover box: clips its art to a squircle or a circle. With `id` and no children it draws Artwork.Art for that id.',
      props: props<RootOwnProps>({
        size: { type: 'number', description: 'Side in px. Default --hj-artwork-size, else 48.' },
        shape: {
          type: "'squircle' | 'round'",
          default: "'squircle'",
          description: 'Round for artists and stations; squircle for everything else.',
        },
        lift: {
          type: 'boolean',
          description:
            'A soft drop shadow (--hj-shadow-art) — the one shadow hanji allows, for art.',
        },
        id: { type: 'string', description: 'Shorthand: draw the generated art for this id.' },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      dataAttributes: { 'data-shape': 'squircle | round', 'data-lift': 'Lifted.' },
      cssVars: {
        '--hj-artwork-size': 'Side when `size` is not set. Default 48px.',
        '--hj-artwork-radius': 'Corner radius of the squircle. Default radius-sm.',
      },
    },
    {
      name: 'Art',
      element: 'svg',
      slot: 'Artwork.Art',
      className: 'hj-artwork-art',
      description:
        'The generated art. Pure flat SVG, ~25 shapes, no filters; decorative (aria-hidden) — the row around it names the thing.',
      props: props<ArtOwnProps>({
        id: { type: 'string', description: 'Any string; the same id always gets the same face.' },
        face: {
          type: 'number',
          description: 'A face by number, 0–99 (composition × 10 + palette), for galleries.',
        },
        slice: {
          type: 'boolean',
          default: 'true',
          description: 'Crop to fill non-square boxes instead of letterboxing.',
        },
      }),
    },
    {
      name: 'Collage',
      element: 'span',
      slot: 'Artwork.Collage',
      className: 'hj-artwork-collage',
      description:
        'A collection cover from its first covers: full, halves, a half and two quarters, or quarters. Cells tile exactly; four at most.',
      props: props<CollageOwnProps>({
        ids: { type: 'readonly string[]', description: 'The first items’ ids, in order.' },
        fallback: {
          type: 'string',
          description: 'Drawn whole when `ids` is empty, so an empty collection is never a hole.',
        },
      }),
      dataAttributes: { 'data-tiles': '0–4.' },
    },
    {
      name: 'Glyph',
      element: 'span',
      slot: 'Artwork.Glyph',
      className: 'hj-artwork-glyph',
      description:
        'A generated wash, a flat scrim and one glyph, sized 16 · 20 · 24 · 28 for boxes under 48 · 72 · 120 px and above.',
      props: props<GlyphOwnProps>({
        id: { type: 'string', description: 'Seeds the wash.' },
        children: { type: 'ReactNode', description: 'The glyph — any icon element.' },
      }),
    },
    {
      name: 'Image',
      element: 'img',
      slot: 'Artwork.Image',
      className: 'hj-artwork-image',
      description:
        'A real cover that fades in when loaded. Generated art stands in only if the image is slow (over 400 ms) or fails — never under it.',
      props: props<ImageOwnProps>({
        src: { type: 'string', description: 'Image URL.' },
        alt: { type: 'string', description: 'Empty when the row already names the thing.' },
        id: { type: 'string', description: 'Seeds the stand-in art.' },
      }),
      dataAttributes: { 'data-state': 'loading | slow | loaded | failed' },
    },
  ],
  examples: [
    {
      file: 'covers',
      title: 'Covers in a list',
      description:
        'Every title gets its own face, and keeps it — type any title and it never changes.',
    },
    {
      file: 'faces',
      title: 'All 100 faces',
      description: 'Ten palettes × ten compositions, by number. Pick one with `face`.',
    },
    {
      file: 'collage',
      title: 'Collage covers',
      description: 'A playlist from its first one to four covers, and an empty one.',
    },
    {
      file: 'glyph',
      title: 'Glyph covers',
      description: 'Categories and folders: nothing to read, so a glyph says so.',
    },
  ],
  accessibility: [
    'Art is decorative (aria-hidden): the row or card around it must name the thing.',
    'Artwork.Image keeps its alt text; leave it empty when the name is already beside it.',
    'Glyph covers carry no meaning beyond their label; the glyph is decorative too.',
  ],
  motion: 'Artwork.Image fades in when loaded (base duration). Art itself never moves.',
  tokens: [
    'surface-2',
    'radius-sm',
    'radius-pill',
    'shadow-art',
    'scrim',
    'on-scrim',
    'dur-base',
    'ease-out',
  ],
  related: ['avatar', 'list', 'card'],
});
