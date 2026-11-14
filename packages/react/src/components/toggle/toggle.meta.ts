import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ToggleOwnProps } from './toggle.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Toggle',
  slug: 'toggle',
  category: 'controls',
  status: 'stable',
  description: 'A button that stays pressed until pressed again: Shuffle, Bold, Mute.',
  whenToUse: [
    'A mode on a tool or a player that the user flips in place (shuffle, repeat, bold).',
    'Several of them side by side — wrap in ToggleGroup.',
  ],
  whenNotToUse: [
    'A setting in a settings list — use Switch.',
    'One of several, always one chosen — use SegmentedControl.',
    'An action that does something once — use Button.',
  ],
  import: "import { Toggle } from '@hanji/react';",
  parts: [
    {
      name: 'Toggle',
      element: 'button',
      base: 'Toggle',
      slot: 'Toggle',
      className: 'hj-toggle',
      description:
        'pressed / defaultPressed / onPressedChange; `value` identifies it inside a ToggleGroup.',
      props: props<ToggleOwnProps>({
        size: {
          type: "'sm' | 'md'",
          default: "'md' (or the group's)",
          description: 'Heights 32 / 40. Inside a ToggleGroup the group sets it.',
        },
        variant: {
          type: "'quiet' | 'outline'",
          default: "'quiet'",
          description:
            'quiet = no fill until pressed; outline = surface + hairline. Ignored inside a group.',
        },
        iconOnly: {
          type: 'boolean',
          default: 'false',
          description: 'Square, for a lone icon; needs aria-label.',
        },
      }),
      dataAttributes: {
        'data-pressed': 'Pressed (Base UI) — accent-soft fill, accent glyph.',
        'data-variant': 'quiet | outline | grouped',
        'data-size': 'sm | md',
        'data-icon-only': 'Square.',
        'data-disabled': 'Disabled.',
      },
      cssVars: {
        '--hj-toggle-height': 'Height (and min width).',
        '--hj-toggle-radius': 'Corner radius. Default pill.',
      },
    },
  ],
  examples: [
    {
      file: 'player',
      title: 'Player modes',
      description:
        'Shuffle and repeat as icon toggles, labelled outline toggles, and a disabled one.',
    },
    {
      file: 'states',
      title: 'Controlled',
      description: 'A mute toggle whose label and consequence follow its state.',
    },
  ],
  accessibility: [
    'A native <button> with aria-pressed; Space and Enter flip it.',
    'Icon-only toggles need aria-label — the pressed state is announced separately.',
  ],
  motion:
    'Pressed is colour on a 180 ms ease-out; the button dips to .97 on press and releases on snappy.',
  tokens: ['accent', 'accent-soft', 'fg-dim', 'surface', 'line', 'radius-pill', 'press'],
  related: ['toggle-group', 'switch', 'button', 'segmented-control'],
  baseUi: 'toggle',
});
