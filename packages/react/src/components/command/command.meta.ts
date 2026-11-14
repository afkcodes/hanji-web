import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  DialogOwnProps,
  EmptyOwnProps,
  GroupOwnProps,
  ItemOwnProps,
  LoadingOwnProps,
  PageOwnProps,
  RootOwnProps,
  ShortcutOwnProps,
} from './command.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Command',
  slug: 'command',
  category: 'navigation',
  status: 'new',
  description:
    'A command palette: a search field over grouped commands, ranked as you type, inline or as a ⌘K dialog.',
  whenToUse: [
    'Power users jumping anywhere or running any action without the mouse (⌘K).',
    'A long list of actions that would bury a menu: search beats scanning past ~12 items.',
    'Mixed results — pages, recent files, people, actions — in one keyboard-first surface.',
    'Asking the assistant: a forceMount row that hands the query to AI when commands run out.',
  ],
  whenNotToUse: [
    'Choosing a value for a form field — use Combobox (it remembers the selection).',
    'Free-text search with suggestions that leads to a results page — use Autocomplete.',
    'A handful of actions on one object — use Menu.',
    'The only way to reach something: every command should also live somewhere visible.',
  ],
  import: "import { Command } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Autocomplete.Root',
      slot: 'Command.Root',
      className: 'hj-command',
      description:
        'The inline palette (an always-open, inline Base UI Autocomplete). Owns the query, the page stack and the item registry; ranks with `Command.defaultFilter(text, query, keywords)` unless `filter` says otherwise.',
      dataAttributes: {
        'data-searching': 'The query is not empty.',
        'data-page': 'The open page id (absent at the root).',
      },
      cssVars: {
        '--hj-command-radius': 'Corner radius of the palette (and the dialog). Default radius-lg.',
      },
      props: props<RootOwnProps>({
        query: { type: 'string', description: 'Controlled search text.' },
        defaultQuery: { type: 'string', default: "''", description: 'Initial search text.' },
        onQueryChange: {
          type: '(query: string) => void',
          description: 'Called as the user types (not when a command runs).',
        },
        filter: {
          type: 'boolean | (text, query, keywords) => number',
          default: 'true',
          description:
            '`true` ranks with defaultFilter (exact > prefix > word start > initials > substring > fuzzy). A function returns a score, 0 hides. `false` shows items as rendered — for async or server-ranked results.',
        },
        pages: {
          type: 'readonly string[]',
          description: 'Controlled page stack (Page ids, root first).',
        },
        defaultPages: { type: 'readonly string[]', default: '[]', description: 'Initial stack.' },
        onPagesChange: {
          type: '(pages: readonly string[]) => void',
          description: 'Called when a page opens or closes.',
        },
        loop: {
          type: 'boolean',
          default: 'true',
          description: 'Arrow keys wrap between the last and first command.',
        },
      }),
    },
    {
      name: 'Dialog',
      element: 'div (portal)',
      base: 'Dialog.Root + Dialog.Popup',
      slot: 'Command.Dialog',
      className: 'hj-command-dialog',
      description:
        'The ⌘K palette: scrim + top-aligned modal popup holding a Root. Accepts every Root prop too; className goes to the surface.',
      cssVars: {
        '--hj-command-dialog-width': 'Popup width. Default 600px.',
        '--hj-command-dialog-top': 'Distance from the top of the viewport. Default 12vh.',
      },
      props: props<DialogOwnProps>({
        open: { type: 'boolean', description: 'Controlled open state.' },
        defaultOpen: { type: 'boolean', default: 'false', description: 'Initially open.' },
        onOpenChange: { type: '(open: boolean) => void', description: 'Open or closed.' },
        hotkey: {
          type: 'string | false',
          default: "'mod+k'",
          description:
            'Global toggle. `mod` is ⌘ on Apple, Ctrl elsewhere; combine with shift, alt, ctrl. `false` for none.',
        },
        label: {
          type: 'string',
          description: 'Accessible name of the dialog. Defaults to strings.commandPalette.',
        },
        closeOnSelect: {
          type: 'boolean',
          default: 'true',
          description: 'Close after a command runs. Items that open a page never close it.',
        },
        container: {
          type: 'HTMLElement | ShadowRoot | RefObject',
          description: 'Portal target. Defaults to <body>; the nearest Theme is kept.',
        },
      }),
    },
    {
      name: 'Input',
      element: 'input',
      base: 'Autocomplete.Input',
      slot: 'Command.Input',
      className: 'hj-command-input',
      description:
        'The combobox, in a 56px field (.hj-command-field) with a search glyph and a breadcrumb chip per open page. Escape clears the text, then leaves the page; Backspace on an empty field leaves the page. Labelled strings.commandSearch.',
      cssVars: {
        '--hj-command-input-height': 'Field height. Default 56px (density-scaled).',
      },
    },
    {
      name: 'List',
      element: 'div',
      base: 'Autocomplete.List',
      slot: 'Command.List',
      className: 'hj-command-list',
      description:
        'The listbox. Holds Groups, Items, Separators and Pages. Scrolls; slides sideways when a page opens or closes.',
      dataAttributes: {
        'data-nav': "'forward' | 'back' after a page change (drives the slide).",
      },
      cssVars: {
        '--hj-command-list-height':
          'Max height. Default 340px inline, min(380px, 56dvh) in Dialog.',
      },
    },
    {
      name: 'Group',
      element: 'div',
      base: 'Autocomplete.Group',
      slot: 'Command.Group',
      className: 'hj-command-group',
      description:
        'A labelled run of commands. Hidden while the query matches none of them; while searching, groups reorder by their best match.',
      props: props<GroupOwnProps>({
        label: {
          type: 'ReactNode',
          description: 'Eyebrow heading (renders GroupLabel, which names the group).',
        },
      }),
    },
    {
      name: 'GroupLabel',
      element: 'div',
      base: 'Autocomplete.GroupLabel',
      slot: 'Command.GroupLabel',
      className: 'hj-command-group-label',
      description: 'Uppercase eyebrow. Rendered for you by Group’s `label`.',
    },
    {
      name: 'Item',
      element: 'div',
      base: 'Autocomplete.Item',
      slot: 'Command.Item',
      className: 'hj-command-item',
      description:
        'One command row (42px): an optional leading Icon, the label, then Detail, Shortcut or a page chevron. Unmatched items unmount; matches rank best-first. Also accepts `disabled` (focusable, never runs).',
      dataAttributes: {
        'data-highlighted': 'The row Enter would run.',
        'data-disabled': 'Disabled.',
        'data-page': 'The page this item opens.',
      },
      cssVars: {
        '--hj-command-item-height': 'Min row height. Default 42px (density-scaled).',
      },
      props: props<ItemOwnProps>({
        value: {
          type: 'string',
          description:
            'Text the filter matches and onSelect receives. Defaults to the row’s text, without Shortcut and Detail.',
        },
        keywords: {
          type: 'readonly string[]',
          description:
            'Extra words that find it: synonyms, old names (“preferences” for Settings).',
        },
        onSelect: {
          type: '(value: string) => void',
          description: 'Runs the command — click, or Enter while highlighted.',
        },
        page: {
          type: 'string',
          description: 'Open this Page instead of running; shows a chevron.',
        },
        forceMount: {
          type: 'boolean',
          default: 'false',
          description:
            'Always shown, ranked last in its group, not counted for Empty — for “Ask hanji about …”.',
        },
      }),
    },
    {
      name: 'Shortcut',
      element: 'span',
      slot: 'Command.Shortcut',
      className: 'hj-command-shortcut',
      description: 'Keys at the row’s end, drawn as small Kbds. Not part of the match.',
      props: props<ShortcutOwnProps>({
        keys: {
          type: 'readonly string[]',
          description:
            "e.g. ['mod', 'shift', 'C']. mod → ⌘ / Ctrl; shift, alt, ctrl, enter, backspace, esc, tab and arrows get glyphs. Or pass children.",
        },
      }),
    },
    {
      name: 'Detail',
      element: 'span',
      slot: 'Command.Detail',
      className: 'hj-command-detail',
      description:
        'Quiet trailing text in tabular numerals (“Mira Okafor · 2h”). Not part of the match.',
    },
    {
      name: 'Separator',
      element: 'div',
      base: 'Autocomplete.Separator',
      slot: 'Command.Separator',
      className: 'hj-command-separator',
      description: 'Full-bleed hairline between groups. Hidden while searching.',
    },
    {
      name: 'Page',
      element: '(none)',
      slot: 'Command.Page',
      className: '',
      description:
        'A nested list opened by an Item’s `page`. Place Pages directly in List as siblings; content outside every Page is the root. Opening or leaving a page clears the query and starts fresh on its first command, focus kept in the field.',
      props: props<PageOwnProps>({
        id: { type: 'string', description: 'What an Item’s `page` opens.' },
        label: { type: 'string', description: 'Breadcrumb chip text. Defaults to the id.' },
        placeholder: {
          type: 'string',
          description: 'The field’s placeholder while this page is open (“Pick a theme…”).',
        },
      }),
    },
    {
      name: 'Empty',
      element: 'div',
      slot: 'Command.Empty',
      className: 'hj-command-empty',
      description:
        'Polite live region shown when nothing matches and nothing is loading. Place after List; keep it mounted.',
      dataAttributes: { 'data-empty': 'Showing its message.' },
      props: props<EmptyOwnProps>({
        children: {
          type: 'ReactNode | (query) => ReactNode',
          description: 'Say what was searched and what to try. Defaults to strings.commandEmpty.',
        },
      }),
    },
    {
      name: 'Loading',
      element: 'div',
      slot: 'Command.Loading',
      className: 'hj-command-loading',
      description:
        'Status row with a small Spinner (“Searching people…”). Place before List: the stale list below dims; Empty waits.',
      dataAttributes: { 'data-loading': 'Work in flight.' },
      props: props<LoadingOwnProps>({
        loading: {
          type: 'boolean',
          default: 'true',
          description: 'Keep it mounted and flip this, so the change is announced.',
        },
      }),
    },
    {
      name: 'Footer',
      element: 'div',
      slot: 'Command.Footer',
      className: 'hj-command-footer',
      description: 'Hairline footer for key hints (↵ run · esc close) or a status line.',
    },
  ],
  examples: [
    {
      file: 'app',
      title: 'App commands',
      description:
        'Recent files, navigation and actions with shortcuts, a “Change theme…” page with a breadcrumb chip, and an “Ask hanji” row that echoes the query.',
    },
    {
      file: 'dialog',
      title: '⌘K dialog',
      description: 'Press ⌘K (Ctrl K) anywhere. Escape steps back: text, then page, then closes.',
    },
    {
      file: 'async',
      title: 'Async people search',
      description:
        'filter={false} with server results: a loading row over the dimmed stale list, a no-results line that names the query, and a failure state.',
    },
  ],
  accessibility: [
    'WAI-ARIA combobox with a listbox (Base UI): focus stays in the input; Up/Down move the highlight (aria-activedescendant), Enter runs it, Home/End move the caret.',
    'Ranking reorders rows visually with CSS order and Base UI’s explicit index, so arrow keys follow what is seen; aria-posinset/aria-setsize carry the ranked position.',
    'Groups are role=group named by their label; empty groups are hidden from the tree.',
    'Empty and Loading are polite live regions that stay mounted — results and “no results” are announced.',
    'Breadcrumb chips are labelled “Back — Theme” and kept out of the tab order (Backspace/Escape do the same); the input is described by the open page.',
    'Dialog is modal, named strings.commandPalette, returns focus on close. Disabled items stay focusable but never run.',
  ],
  motion:
    'One detail: opening a page slides its list in from the right, going back slides in from the left (18px on gentle-settle; the list remounts per page, so the entrance replays; a fade under reduced motion). The breadcrumb chip arrives on snappy-settle; the dialog grows from .96 at the top edge and leaves in 140 ms. Highlight is colour only — no travel while you arrow.',
  tokens: [
    'surface-2',
    'line',
    'fg',
    'fg-mute',
    'accent',
    'accent-soft',
    'radius-lg',
    'radius-xs',
    'radius-pill',
    'type-eyebrow',
    'z-overlay',
    'scrim',
  ],
  related: ['autocomplete', 'combobox', 'menu', 'dialog', 'kbd'],
  baseUi: 'autocomplete',
});
