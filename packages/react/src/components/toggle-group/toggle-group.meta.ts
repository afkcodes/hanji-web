import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ToggleGroupOwnProps } from './toggle-group.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'ToggleGroup',
  slug: 'toggle-group',
  category: 'controls',
  status: 'stable',
  description: 'A row of Toggles in one frame, sharing a value array.',
  whenToUse: [
    'Formatting bars (Bold, Italic, Underline) with `multiple`.',
    'A single-choice set where none chosen is allowed (text alignment you can clear).',
  ],
  whenNotToUse: [
    'One option must always be chosen — use SegmentedControl.',
    'Actions, not states — use a Toolbar of Buttons.',
  ],
  import: "import { Toggle, ToggleGroup } from '@hanji/react';",
  parts: [
    {
      name: 'ToggleGroup',
      element: 'div',
      base: 'ToggleGroup',
      slot: 'ToggleGroup',
      className: 'hj-toggle-group',
      description:
        'value / defaultValue / onValueChange (string[]), multiple, orientation, loopFocus. Holds Toggle children with a value each; they take its size.',
      props: props<ToggleGroupOwnProps>({
        size: {
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Size for the frame and every Toggle in it.',
        },
      }),
      dataAttributes: {
        'data-size': 'sm | md',
        'data-orientation': 'horizontal | vertical (Base UI)',
        'data-multiple': 'Several may be pressed (Base UI).',
        'data-disabled': 'Disabled.',
      },
      cssVars: {
        '--hj-toggle-group-pad': 'Frame padding.',
        '--hj-toggle-group-gap': 'Gap between toggles.',
      },
    },
  ],
  examples: [
    {
      file: 'formatting',
      title: 'Formatting',
      description:
        'Bold / Italic / Underline with multiple, and an alignment set that can be cleared.',
    },
    {
      file: 'vertical',
      title: 'Vertical and disabled',
      description: 'An EQ preset picker standing up, and a group locked during playback.',
    },
  ],
  accessibility: [
    'Roving focus: arrows move between toggles (loopFocus by default), Tab leaves the group.',
    'Each toggle exposes aria-pressed; label icon-only toggles.',
  ],
  motion: 'Inherits Toggle: pressed is colour, the press dips to .97.',
  tokens: ['surface', 'line', 'radius-pill', 'radius-lg'],
  related: ['toggle', 'segmented-control', 'toolbar'],
  baseUi: 'toggle-group',
});
