import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ContentOwnProps, OptionOwnProps, TriggerOwnProps } from './select.tsx';

const popupAttrs = {
  'data-open': 'Open.',
  'data-side': "'none' when aligned over the trigger, else top | bottom | left | right.",
  'data-starting-style': 'Entering.',
  'data-ending-style': 'Leaving.',
};

export const meta: ComponentMeta = defineMeta({
  name: 'Select',
  slug: 'select',
  category: 'controls',
  status: 'stable',
  description:
    'Choose one value (or several) from a list that is too long, or too dynamic, for radios.',
  whenToUse: [
    'Five or more mutually exclusive options: time zone, quality, country.',
    'A value whose options carry a consequence worth a second line.',
  ],
  whenNotToUse: [
    'Two to four options always worth seeing — use SegmentedControl or RadioGroup.',
    'Options the user should be able to type to filter — use Combobox.',
    'Actions rather than values — use Menu.',
  ],
  import: "import { Select } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: '(none)',
      base: 'Select.Root',
      slot: 'Select.Root',
      className: '',
      description:
        'State: value, defaultValue, onValueChange, items (for labels), multiple, open, name.',
    },
    {
      name: 'Label',
      element: 'label',
      base: 'Select.Label',
      slot: 'Select.Label',
      className: 'hj-select-label',
      description: '13/600, like Field.Label.',
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Select.Trigger',
      slot: 'Select.Trigger',
      className: 'hj-select-trigger',
      description:
        'The closed select, drawn like Field.Control. Childless, it renders Value + Icon.',
      props: props<TriggerOwnProps>({
        size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Heights 40 / 48 / 56.' },
        placeholder: {
          type: 'ReactNode',
          description: 'Shown while nothing is selected (only when the Trigger has no children).',
        },
      }),
      dataAttributes: {
        'data-popup-open': 'Open.',
        'data-placeholder': 'Nothing selected.',
        'data-invalid': 'Invalid (inside Field.Root).',
        'data-disabled': 'Disabled.',
        'data-size': 'sm | md | lg',
      },
      cssVars: {
        '--hj-select-height': 'Trigger height.',
        '--hj-select-radius': 'Trigger corner radius. Default radius-sm.',
      },
    },
    {
      name: 'Value',
      element: 'span',
      base: 'Select.Value',
      slot: 'Select.Value',
      className: 'hj-select-value',
      description: 'The chosen label, or the placeholder (muted).',
    },
    {
      name: 'Icon',
      element: 'span',
      base: 'Select.Icon',
      slot: 'Select.Icon',
      className: 'hj-select-icon',
      description: 'The chevron (icon adapter: chevronDown).',
    },
    {
      name: 'Portal',
      element: '(portal)',
      base: 'Select.Portal',
      slot: 'Select.Portal',
      className: '',
      description: 'Portals to body and re-applies the nearest Theme.',
    },
    {
      name: 'Positioner',
      element: 'div',
      base: 'Select.Positioner',
      slot: 'Select.Positioner',
      className: 'hj-select-positioner',
      description:
        'Places the popup: sideOffset 6, collisionPadding 8, item aligned over the trigger by default.',
    },
    {
      name: 'Popup',
      element: 'div',
      base: 'Select.Popup',
      slot: 'Select.Popup',
      className: 'hj-select-popup',
      description: 'surface-2, hairline, the lift shadow; grows from --transform-origin.',
      dataAttributes: popupAttrs,
      cssVars: { '--hj-select-popup-radius': 'Popup corner radius. Default radius-md.' },
    },
    {
      name: 'List',
      element: 'div',
      base: 'Select.List',
      slot: 'Select.List',
      className: 'hj-select-list',
      description: 'Scroll container for the items; max height = available height.',
    },
    {
      name: 'Item',
      element: 'div',
      base: 'Select.Item',
      slot: 'Select.Item',
      className: 'hj-select-item',
      description: 'One option: a two-column grid (indicator, text).',
      dataAttributes: {
        'data-highlighted': 'Keyboard/pointer highlight.',
        'data-selected': 'Chosen.',
        'data-disabled': 'Disabled.',
      },
      cssVars: { '--hj-select-item-height': 'Minimum row height. Default 40px.' },
    },
    {
      name: 'ItemIndicator',
      element: 'span',
      base: 'Select.ItemIndicator',
      slot: 'Select.ItemIndicator',
      className: 'hj-select-item-indicator',
      description: 'The accent check on the chosen item.',
    },
    {
      name: 'ItemText',
      element: 'span',
      base: 'Select.ItemText',
      slot: 'Select.ItemText',
      className: 'hj-select-item-text',
      description: 'The label; also what Value shows.',
    },
    {
      name: 'Option',
      element: 'div',
      slot: 'Select.Item',
      className: 'hj-select-item',
      description: 'Shorthand: Item + ItemIndicator + ItemText (+ an optional second line).',
      props: props<OptionOwnProps>({
        description: {
          type: 'ReactNode',
          description: 'Second line, e.g. a consequence (“about 1.4 GB an hour”).',
        },
      }),
    },
    {
      name: 'Content',
      element: '(portal)',
      slot: 'Select.Popup',
      className: 'hj-select-popup',
      description:
        'Shorthand: Portal + Positioner + Popup + scroll arrows + List; children are the items.',
      props: props<ContentOwnProps>({
        side: {
          type: "'top' | 'bottom' | 'left' | 'right' | …",
          description: 'Preferred side when not aligned over the trigger.',
        },
        align: {
          type: "'start' | 'center' | 'end'",
          description: 'Alignment against the trigger.',
        },
        alignItemWithTrigger: {
          type: 'boolean',
          default: 'true',
          description: 'Overlay the chosen item on the trigger.',
        },
        container: {
          type: 'HTMLElement | ShadowRoot | RefObject',
          description: 'Portal target. Default body.',
        },
      }),
    },
    {
      name: 'Group',
      element: 'div',
      base: 'Select.Group',
      slot: 'Select.Group',
      className: 'hj-select-group',
      description: 'Groups related items.',
    },
    {
      name: 'GroupLabel',
      element: 'div',
      base: 'Select.GroupLabel',
      slot: 'Select.GroupLabel',
      className: 'hj-select-group-label',
      description: 'Eyebrow-style group heading.',
    },
    {
      name: 'Separator',
      element: 'div',
      base: 'Select.Separator',
      slot: 'Select.Separator',
      className: 'hj-select-separator',
      description: 'A hairline between groups.',
    },
    {
      name: 'ScrollUpArrow',
      element: 'div',
      base: 'Select.ScrollUpArrow',
      slot: 'Select.ScrollUpArrow',
      className: 'hj-select-scroll-arrow',
      description: 'Appears when the list can scroll up; hover to scroll.',
    },
    {
      name: 'ScrollDownArrow',
      element: 'div',
      base: 'Select.ScrollDownArrow',
      slot: 'Select.ScrollDownArrow',
      className: 'hj-select-scroll-arrow',
      description: 'Appears when the list can scroll down.',
    },
    {
      name: 'Backdrop',
      element: 'div',
      base: 'Select.Backdrop',
      slot: 'Select.Backdrop',
      className: 'hj-select-backdrop',
      description: 'Optional invisible layer under the popup.',
    },
    {
      name: 'Arrow',
      element: 'div',
      base: 'Select.Arrow',
      slot: 'Select.Arrow',
      className: 'hj-select-arrow',
      description: 'Optional pointer to the trigger.',
    },
  ],
  examples: [
    {
      file: 'quality',
      title: 'Options with consequences',
      description: 'Each quality says what it costs.',
    },
    {
      file: 'grouped',
      title: 'Groups, errors and disabled',
      description: 'Time zones by region, a required choice left empty, and a locked field.',
    },
  ],
  accessibility: [
    'Trigger is a combobox button; the popup is a listbox. Arrow keys move, typeahead jumps, Enter selects, Escape closes.',
    'Label it with Select.Label (or wrap in Field.Root with Field.Label).',
    'With alignItemWithTrigger the chosen item opens under the pointer; otherwise the popup flips to stay in view.',
  ],
  motion:
    'Popup grows from the trigger (scale .96 → 1 on snappy) and leaves in 180 ms; when aligned over the trigger it only fades. Focus and error are colour on ease-out.',
  tokens: [
    'surface',
    'surface-2',
    'line',
    'accent',
    'danger',
    'shadow-lift',
    'radius-sm',
    'radius-md',
    'ease-snappy',
  ],
  related: ['combobox', 'segmented-control', 'radio-group', 'menu', 'field'],
  baseUi: 'select',
});
