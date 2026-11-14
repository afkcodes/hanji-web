import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { SquircleOwnProps } from './squircle.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Squircle',
  slug: 'squircle',
  category: 'atoms',
  status: 'stable',
  description: 'A continuous-corner (squircle) surface — hanji’s corner, exact on every browser.',
  whenToUse: [
    'Art, covers, avatars and tiles that should carry hanji’s continuous corner everywhere, including browsers without CSS corner-shape.',
    'An SVG mask or outline in the same shape (use squirclePath).',
  ],
  whenNotToUse: [
    'Regular components — they already get continuous corners from the --hj-corner-shape token.',
    'Elements that need focus rings or outer shadows in browsers without corner-shape (the clip-path fallback clips them).',
  ],
  import: "import { Squircle, squirclePath } from '@hanji/react';",
  parts: [
    {
      name: 'Squircle',
      element: 'div',
      slot: 'Squircle',
      className: 'hj-squircle',
      description:
        'Where CSS corner-shape exists: radius × (1 + smoothing) with a fitted superellipse (cornerShape), which traces the figma squircle. Otherwise it measures itself and clips to the exact figma path. `squirclePath(w, h, radius, smoothing)` returns that path for SVG.',
      props: props<SquircleOwnProps>({
        radius: {
          type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | number",
          default: "'md'",
          description: 'A radius token or px.',
        },
        smoothing: {
          type: 'number',
          default: '0.72',
          description: '0 circular · .72 hanji · 1 most continuous.',
        },
        exact: {
          type: 'boolean',
          default: 'false',
          description:
            'Always clip to the exact figma path (pixel-identical to native), even where corner-shape exists.',
        },
      }),
      dataAttributes: { 'data-clipped': 'Present when drawn with the clip-path fallback.' },
      cssVars: {
        '--hj-squircle-radius': 'Set from radius.',
        '--hj-squircle-shape': 'Set from smoothing (fitted superellipse).',
        '--hj-squircle-span': 'Set from smoothing: 1 + smoothing.',
        '--hj-corner-shape':
          'Theme-wide corner shape every component uses (createTheme({ smoothing })).',
      },
    },
  ],
  examples: [
    {
      file: 'compare',
      title: 'Circular vs continuous',
      description: 'The dashed line is a circular corner of the same radius.',
    },
    {
      file: 'surfaces',
      title: 'Art and sheets',
      description: 'Cover tiles at radius lg and a 28px sheet corner.',
    },
  ],
  accessibility: [
    'Purely visual. Give art an accessible name (role="img" + aria-label) when it carries meaning.',
  ],
  motion: 'None. The clip-path fallback re-measures on resize (one ResizeObserver per instance).',
  tokens: ['radius-md', 'corner-shape'],
  related: ['avatar', 'card', 'sheet'],
});
