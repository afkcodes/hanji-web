import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ContentOwnProps, LayerOwnProps } from './scrim.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Scrim',
  slug: 'scrim',
  category: 'atoms',
  status: 'stable',
  description:
    'A gradient that darkens imagery just enough for text to sit on it, in one colour fading by opacity.',
  whenToUse: [
    'A title, artist or controls over album art, a hero photo or a video frame.',
    'Chrome (back, more) over the top of a full-bleed image.',
  ],
  whenNotToUse: [
    'Behind a dialog or sheet — those have their own black backdrop.',
    'Over flat paper — text on paper needs no help.',
  ],
  import: "import { Scrim } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Scrim.Root',
      className: 'hj-scrim',
      description:
        'The frame: image, layer and content, clipped to radius-md. Direct img/picture/video children cover it.',
      cssVars: { '--hj-scrim-radius': 'Corner radius. Default radius-md.' },
    },
    {
      name: 'Layer',
      element: 'span',
      slot: 'Scrim.Layer',
      className: 'hj-scrim-layer',
      description:
        'The gradient: one RGB fading by opacity on an eased five-stop curve, so there is no visible edge. aria-hidden.',
      props: props<LayerOwnProps>({
        edge: {
          type: "'bottom' | 'top' | 'full'",
          default: "'bottom'",
          description: 'Where the dark sits.',
        },
        strength: { type: 'number', default: '0.72', description: 'Darkness at the edge, 0–1.' },
        extent: {
          type: 'string',
          default: "'64%'",
          description: 'How far the fade reaches (CSS length or %).',
        },
        color: {
          type: 'string',
          default: 'scrim token (black)',
          description: 'Fade colour. Pass the art’s own deep colour to keep the fade in its hue.',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: { 'data-edge': 'bottom | top | full' },
      cssVars: {
        '--hj-scrim-strength': 'Darkness as a percentage (set by strength).',
        '--hj-scrim-extent': 'Reach of the fade.',
        '--hj-scrim-color': 'Fade colour.',
      },
    },
    {
      name: 'Content',
      element: 'div',
      slot: 'Scrim.Content',
      className: 'hj-scrim-content',
      description:
        'Text and controls over the image. Re-points --hj-fg, -dim, -mute and -line at on-scrim, so hanji components inside read light.',
      props: props<ContentOwnProps>({
        edge: {
          type: "'bottom' | 'top' | 'center'",
          default: "'bottom'",
          description: 'Where it sits; match the Layer.',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: { 'data-edge': 'bottom | top | center' },
    },
  ],
  examples: [
    {
      file: 'cover',
      title: 'Over a cover',
      description: 'Title and artist on art, with a black scrim and one tinted in the art’s hue.',
    },
    {
      file: 'hero',
      title: 'Chrome over a hero',
      description: 'A top scrim for back and more, a bottom one for the title.',
    },
  ],
  accessibility: [
    'Over imagery, ink is always light on a dark scrim — never muted paper ink.',
    'The layer is decorative (aria-hidden); the image still needs its own alt text.',
    'Check contrast against the brightest part of the image under the text, not the average.',
  ],
  tokens: ['scrim', 'on-scrim', 'radius-md', 'space-4', 'space-5'],
  related: ['avatar', 'text'],
});
