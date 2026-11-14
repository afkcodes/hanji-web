import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { GroupOwnProps, RootOwnProps } from './avatar.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Avatar',
  slug: 'avatar',
  category: 'atoms',
  status: 'stable',
  description:
    'A person as a picture, or as their initials on a tint that stays theirs everywhere.',
  whenToUse: [
    'People in lists, comments, shares and collaborator stacks.',
    'An artist or account where a portrait identifies it.',
  ],
  whenNotToUse: ['Album or playlist art — use a square cover; avatars are round on purpose.'],
  import: "import { Avatar } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'span',
      base: 'Avatar.Root',
      slot: 'Avatar.Root',
      className: 'hj-avatar',
      description: 'The circle. With name/src and no children it renders Image + Fallback itself.',
      props: props<RootOwnProps>({
        name: {
          type: 'string',
          description: 'Drives initials (JP), the tint (stable hash → data-1…6) and alt text.',
        },
        src: {
          type: 'string',
          description: 'Image URL. Initials show only if it is slow (>600 ms) or fails.',
        },
        size: {
          type: '24 | 32 | 40 | 56',
          default: '40 (or the group’s size)',
          description: 'Diameter in px.',
        },
        presence: {
          type: "'online' | 'away' | 'busy' | 'offline'",
          description: 'Corner dot with its word for screen readers.',
        },
        presenceLabel: {
          type: 'string',
          description: 'Word read for presence. Defaults to the value, capitalised.',
        },
      }),
      dataAttributes: {
        'data-size': '24 | 32 | 40 | 56',
        'data-tint': '1–6, from the name.',
      },
      cssVars: {
        '--hj-avatar-size': 'Diameter, overriding size.',
        '--hj-avatar-ring': 'Ring colour between grouped faces and around presence. Default bg.',
      },
    },
    {
      name: 'Image',
      element: 'img',
      base: 'Avatar.Image',
      slot: 'Avatar.Image',
      className: 'hj-avatar-image',
      description: 'The picture; fades in when loaded.',
      dataAttributes: { 'data-loading': 'Loading (Base UI).', 'data-error': 'Failed (Base UI).' },
    },
    {
      name: 'Fallback',
      element: 'span',
      base: 'Avatar.Fallback',
      slot: 'Avatar.Fallback',
      className: 'hj-avatar-fallback',
      description:
        'Shown when there is no picture yet or it failed. Use delay to avoid flashing initials.',
    },
    {
      name: 'Group',
      element: 'div',
      slot: 'Avatar.Group',
      className: 'hj-avatar-group',
      description:
        'Overlapping faces (−8px, 2px paper ring) with +N for the rest. Avatars inherit its size.',
      props: props<GroupOwnProps>({
        max: { type: 'number', description: 'Show this many, then “+N”.' },
        size: {
          type: '24 | 32 | 40 | 56',
          default: '32',
          description: 'Size for every avatar inside.',
        },
        label: {
          type: 'string',
          description: 'Accessible summary (“Mira, Jun-seo and 4 others”).',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
    },
  ],
  examples: [
    {
      file: 'people',
      title: 'People',
      description: 'Pictures, initials on their tint, a failed image and presence.',
    },
    { file: 'group', title: 'Group', description: 'A collaborator stack with +N.' },
  ],
  accessibility: [
    'The image gets alt from name; initials are text, so the name should also appear nearby or as aria-label.',
    'Presence is announced as a word, not only a colour.',
    'Group is role="group"; give it a label summarising who is in it.',
  ],
  motion:
    'The picture fades in over 260 ms once loaded; initials wait 600 ms before showing so a fast image never flashes letters.',
  tokens: ['data-1…6', 'surface', 'surface-2', 'bg', 'success', 'warning', 'danger', 'fg-mute'],
  related: ['badge', 'list'],
  baseUi: 'avatar',
});
