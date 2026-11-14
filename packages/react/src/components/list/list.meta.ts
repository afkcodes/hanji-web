import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ItemOwnProps, LeadingOwnProps, RootOwnProps } from './list.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'List',
  slug: 'list',
  category: 'data',
  status: 'stable',
  description:
    'Rows of 56px: artwork or an icon, a title and a line under it, and a value or chevron on the right.',
  whenToUse: [
    'Collections: playlists, downloads, devices, settings that open a page.',
    'Long lists (virtualise them freely — rows carry no React context).',
  ],
  whenNotToUse: [
    'Choosing one or several options — use RadioGroup or CheckboxGroup.',
    'Data compared across columns — use Table.',
    'A menu of commands — use Menu.',
  ],
  import: "import { List } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'ul',
      slot: 'List.Root',
      className: 'hj-list',
      description: 'The list. render={<ol />} for an ordered one.',
      props: props<RootOwnProps>({
        divided: {
          type: 'boolean',
          default: 'true',
          description: 'Hairlines between rows, inset to where the text starts.',
        },
      }),
      dataAttributes: { 'data-divided': 'Present when divided.' },
    },
    {
      name: 'Item',
      element: 'li > div',
      slot: 'List.Item',
      className: 'hj-list-item',
      description:
        'A row. The <li> holds a row element; `render` replaces that inner row (a link or button) so the whole row is interactive and the list stays valid.',
      props: props<ItemOwnProps>({
        selected: {
          type: 'boolean',
          default: 'false',
          description: 'Title in accent; aria-current on interactive rows.',
        },
        disabled: {
          type: 'boolean',
          default: 'false',
          description: 'Dimmed to .4; interactive rows get aria-disabled and leave the tab order.',
        },
      }),
      dataAttributes: {
        'data-interactive': 'Present when render made the row a link or button.',
        'data-selected': 'Selected.',
        'data-disabled': 'Disabled.',
      },
      cssVars: {
        '--hj-list-row-height': 'Minimum row height. Default 56px.',
        '--hj-list-padding': 'Row inline padding. 0 static, 12px interactive.',
        '--hj-list-gap': 'Gap between slots. Default 12px.',
      },
    },
    {
      name: 'Leading',
      element: 'div',
      slot: 'List.Leading',
      className: 'hj-list-leading',
      description: 'Left slot: artwork, an icon in a tint, or an avatar.',
      props: props<LeadingOwnProps>({
        variant: {
          type: "'plain' | 'art' | 'icon' | 'avatar'",
          default: "'plain'",
          description:
            'art = 40px rounded image; icon = glyph in a tinted square; avatar = circle.',
        },
        tone: {
          type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger'",
          default: "'neutral'",
          description: 'Tint for the icon variant.',
        },
      }),
      cssVars: { '--hj-list-leading-size': 'Art / icon / avatar size. Default 40px.' },
    },
    {
      name: 'Content',
      element: 'div',
      slot: 'List.Content',
      className: 'hj-list-content',
      description: 'Title and Description, stacked; takes the free width.',
    },
    {
      name: 'Title',
      element: 'span',
      slot: 'List.Title',
      className: 'hj-list-title',
      description: 'Body 15/500, one line with ellipsis.',
    },
    {
      name: 'Description',
      element: 'span',
      slot: 'List.Description',
      className: 'hj-list-description',
      description: 'Sub 12.5 muted, one line. Put a status glyph first for failed or pending rows.',
    },
    {
      name: 'Trailing',
      element: 'div',
      slot: 'List.Trailing',
      className: 'hj-list-trailing',
      description: 'Right slot: Value, Chevron, a Switch, a ProgressRing, a Button.',
    },
    {
      name: 'Value',
      element: 'span',
      slot: 'List.Value',
      className: 'hj-list-value',
      description: 'A number or duration in tabular mono, right-aligned.',
    },
    {
      name: 'Chevron',
      element: 'span',
      slot: 'List.Chevron',
      className: 'hj-list-chevron',
      description: 'Decorative › for rows that open something.',
    },
  ],
  examples: [
    {
      file: 'library',
      title: 'Library rows',
      description: 'Interactive rows with artwork: one playing, one downloading, one failed.',
    },
    {
      file: 'settings',
      title: 'Settings with icons',
      description: 'Static and linked rows with tinted icons and values.',
    },
  ],
  accessibility: [
    'Static rows are plain list items; interactive rows are real links or buttons inside the <li>.',
    'Selected interactive rows set aria-current.',
    'Disabled interactive rows set aria-disabled and leave the tab order.',
  ],
  motion:
    'Interactive rows answer a press with opacity .75 within 70 ms (rows never scale), and hover with a 4% tint.',
  tokens: [
    'fg',
    'fg-mute',
    'line',
    'accent',
    'type-body',
    'type-sub',
    'type-mono',
    'press-opacity',
  ],
  related: ['table', 'progress-ring', 'avatar', 'switch'],
});
