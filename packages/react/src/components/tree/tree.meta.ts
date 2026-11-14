import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { IconOwnProps, ItemOwnProps, RootOwnProps, RowOwnProps } from './tree.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Tree',
  slug: 'tree',
  category: 'navigation',
  status: 'new',
  description:
    'A tree view: nested items that open and close, with roving focus, the full APG keyboard, single or multiple selection and children that can load on first open.',
  whenToUse: [
    'A hierarchy people move through: a file explorer, a settings sidebar, a table of contents, an org chart.',
    'Deep or lazy hierarchies where showing everything at once would be noise.',
  ],
  whenNotToUse: [
    'One level of rows — use List; one level of sections that open — use Accordion.',
    'Site navigation across pages — use NavigationMenu (links, not a tree widget).',
    'Thousands of visible rows at once — virtualise with VirtualList and a flattened list.',
  ],
  import: "import { Tree } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'ul',
      slot: 'Tree.Root',
      className: 'hj-tree',
      description:
        'role="tree". Compositional by design: Root owns expanded and selected ids (controlled or not), roving focus and every key — ↑↓ Home End move, → opens or enters, ← closes or climbs, `*` opens all siblings, typeahead by label, Enter activates, Space selects (Shift+↑↓ and Ctrl/⌘+A in multiple). It reads the rendered DOM, so items can be mapped, wrapped or recursive. Give it an aria-label.',
      props: props<RootOwnProps>({
        selectionMode: {
          type: "'none' | 'single' | 'multiple'",
          default: "'single'",
          description:
            'none: rows only activate. single: one selected row. multiple: click/Space toggle, a check marks each.',
        },
        expanded: { type: 'readonly string[]', description: 'Open item ids (controlled).' },
        defaultExpanded: { type: 'readonly string[]', description: 'Open item ids at first.' },
        onExpandedChange: {
          type: '(expanded: string[]) => void',
          description: 'Every open or close.',
        },
        selected: { type: 'readonly string[]', description: 'Selected item ids (controlled).' },
        defaultSelected: { type: 'readonly string[]', description: 'Selected ids at first.' },
        onSelectedChange: {
          type: '(selected: string[]) => void',
          description: 'Selection changed.',
        },
        onAction: {
          type: '(id: string) => void',
          description:
            'A row was clicked or got Enter (every selection mode) — navigate, open a file.',
        },
        expandOnClick: {
          type: 'boolean',
          default: "true (false when selectionMode is 'multiple')",
          description:
            'Clicking a parent row (or Enter) also opens/closes it; else only chevron and ←→.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      dataAttributes: { 'data-selection-mode': 'none · single · multiple.' },
      cssVars: {
        '--hj-tree-row-height':
          'Row height. Default 36px × density (≈32 compact); 44px on coarse pointers.',
        '--hj-tree-indent':
          'Indent per level. Default 16px, scaling gently with density (≈14 compact).',
        '--hj-tree-padding': 'Row inline padding. Default 8px × density.',
      },
    },
    {
      name: 'Item',
      element: 'li',
      base: 'Collapsible.Root',
      slot: 'Tree.Item',
      className: 'hj-tree-item',
      description:
        'role="treeitem", the focus target. Loose children (Icon, Label, Meta) become its Row; a Tree.Group child (direct) makes it a parent. aria-level, aria-expanded, aria-selected, aria-setsize and aria-posinset are set for you.',
      props: props<ItemOwnProps>({
        id: {
          type: 'string',
          description: 'Key in expanded/selected and what onAction reports. Not the DOM id.',
        },
        textValue: {
          type: 'string',
          description: 'Text for typeahead and announcements when the label is not plain text.',
        },
        disabled: {
          type: 'boolean',
          description:
            'Still focusable (so it can be found) but not selectable, openable or activatable.',
        },
        load: {
          type: '() => Promise<unknown>',
          description:
            'Load children on first open: a loading row while pending, a failed row (Enter/click retries) if it rejects. Render what loaded in a Tree.Group.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      dataAttributes: {
        'data-expanded': 'Open.',
        'data-selected': 'Selected.',
        'data-disabled': 'Disabled.',
        'data-level': 'Depth, from 1.',
        'data-status': 'On the rows Tree draws itself: loading · empty · error.',
      },
    },
    {
      name: 'Row',
      element: 'div',
      slot: 'Tree.Row',
      className: 'hj-tree-row',
      description:
        'The visible line: chevron (or spacer) + your content; full-width hit area, indent as padding. Item builds it; write it yourself for row-only handlers (context menu, drag) — handlers on Item also fire for nested children.',
      props: props<RowOwnProps>({
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
    },
    {
      name: 'Icon',
      element: 'span',
      slot: 'Tree.Icon',
      className: 'hj-tree-icon',
      description: 'Leading 18px glyph in a fixed column. Decorative (aria-hidden).',
      props: props<IconOwnProps>({
        children: {
          type: 'ReactNode | ((state: { expanded, selected, disabled, level }) => ReactNode)',
          description: 'A glyph, or a function of the item state — an open folder while expanded.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
    },
    {
      name: 'Label',
      element: 'span',
      slot: 'Tree.Label',
      className: 'hj-tree-label',
      description:
        'The name; the treeitem is labelled by it (required, or give Item an aria-label). Ellipsis when long.',
    },
    {
      name: 'Meta',
      element: 'span',
      slot: 'Tree.Meta',
      className: 'hj-tree-meta',
      description:
        'Trailing detail: a count, a size, a Badge. Muted tabular numerals; read as the item’s description.',
    },
    {
      name: 'Group',
      element: 'ul',
      base: 'Collapsible.Panel',
      slot: 'Tree.Group',
      className: 'hj-tree-group',
      description:
        'role="group": the children, mounted only while open, revealed by Base UI’s measured height. Draws the indent guide and the loading, failed and empty rows.',
      dataAttributes: {
        'data-open': 'Open.',
        'data-closed': 'Closed or closing.',
        'data-starting-style': 'Opening.',
        'data-ending-style': 'Closing.',
        'data-arrived': 'Its rows were just loaded lazily (they fade in).',
      },
      cssVars: { '--collapsible-panel-height': 'Measured by Base UI (read-only).' },
    },
  ],
  examples: [
    {
      file: 'files',
      title: 'File explorer',
      description: 'Folders open and close; counts and sizes trail; one file has unsaved changes.',
    },
    {
      file: 'settings',
      title: 'Settings navigation',
      description: 'Single selection drives the pane beside it; a disabled item stays findable.',
    },
    {
      file: 'lazy',
      title: 'Lazy folders',
      description:
        'Children load on first open. Archive 2019 fails the first time — try again; Contracts is empty.',
    },
  ],
  accessibility: [
    'APG Tree View: role tree / treeitem / group, aria-level, aria-setsize, aria-posinset, aria-expanded on parents only, aria-multiselectable in multiple mode.',
    'aria-selected: on the selected item only in single mode (APG), true/false on every item in multiple mode; none in none mode. Multiple mode adds a check so selection is never colour alone.',
    'Roving tabindex: one item is in the tab order — the last focused, else the first selected, else the first. Closing a branch that holds focus moves focus to it.',
    'Keyboard: ↑↓ Home End · → open / first child · ← close / parent (mirrored in RTL) · `*` open siblings · typeahead (repeat a letter to cycle) · Enter activate · Space select · Shift+↑↓ extend · Ctrl/⌘+A select all (multiple).',
    'Lazy children: the group is aria-busy while loading; the failed row is a focusable treeitem (Enter retries); success (“Archive 2019, 12 items”) and failure are announced politely when focus is in the tree (HanjiStrings.treeLoaded / treeLoadFailedOf).',
    'Rows are 36px for pointers and grow to 44px on coarse (touch) pointers. Don’t put buttons inside rows — the row is the control.',
  ],
  motion:
    'The chevron turns 90° on the snappy spring (a hair past, then settles) — the one considered detail. Groups use the declared height exception: Base UI’s --collapsible-panel-height, gentle-settle in, dur-fast out, rows fading with it; when lazy rows replace the loading row the same height keeps growing from where it was (WAAPI on the same tokens) while the new rows fade in. Reduced motion shortens both to quick fades.',
  tokens: [
    'fg',
    'fg-dim',
    'fg-mute',
    'line',
    'accent',
    'accent-soft',
    'danger',
    'danger-soft',
    'focus',
    'radius-xs',
    'type-sub',
    'press-opacity',
    'dur-snappy',
    'ease-snappy',
    'dur-gentle-settle',
    'ease-gentle-settle',
    'dur-fast',
    'dur-base',
    'density',
    'density-size',
    'touch',
  ],
  related: ['list', 'accordion', 'collapsible', 'navigation-menu', 'virtual-list'],
  baseUi: 'collapsible',
});
