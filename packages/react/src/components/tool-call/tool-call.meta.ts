import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  CodeOwnProps,
  RootOwnProps,
  SectionOwnProps,
  StatusOwnProps,
  TriggerOwnProps,
} from './tool-call.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'ToolCall',
  slug: 'tool-call',
  category: 'ai',
  status: 'new',
  description:
    'One tool an assistant called — name, status, arguments and result — collapsed to a line until opened.',
  whenToUse: [
    'Showing what an agent did (searched, fetched, created) inside a reply.',
    'Asking a person to approve an action before it runs: anything that spends money, sends, deletes, publishes or changes access.',
  ],
  whenNotToUse: [
    'The answer itself — put prose in Message.Content.',
    'Never let an agent run a money-moving or destructive tool without status="needs-approval" and an explicit Approve.',
  ],
  import: "import { ToolCall } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Collapsible.Root',
      slot: 'ToolCall.Root',
      className: 'hj-tool-call',
      description: 'The card. Opens by default when it needs approval.',
      props: props<RootOwnProps>({
        status: {
          type: "'pending' | 'running' | 'done' | 'failed' | 'needs-approval'",
          default: "'pending'",
          description:
            'Drives Status (word + glyph + tint) and the border: warning for approval, danger for failure.',
        },
      }),
      dataAttributes: {
        'data-status': 'pending | running | done | failed | needs-approval',
        'data-open': 'Expanded (Base UI).',
      },
      cssVars: {
        '--hj-tool-call-radius': 'Corner radius. Default radius-md.',
        '--hj-tool-call-bg': 'Fill. Default bg-soft.',
      },
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Collapsible.Trigger',
      slot: 'ToolCall.Trigger',
      className: 'hj-tool-call-trigger',
      description: 'Header row: tool glyph, Name, Status, and a chevron that turns when open.',
      props: props<TriggerOwnProps>({
        icon: {
          type: 'ReactNode',
          default: 'icons.tool',
          description: 'Replace the leading glyph.',
        },
      }),
      dataAttributes: { 'data-panel-open': 'Expanded (Base UI).' },
    },
    {
      name: 'Name',
      element: 'span',
      slot: 'ToolCall.Name',
      className: 'hj-tool-call-name',
      description: 'Tool name in mono, truncated.',
    },
    {
      name: 'Status',
      element: 'span',
      slot: 'ToolCall.Status',
      className: 'hj-tool-call-status',
      description:
        'Queued / Running (spinner) / Done / Failed / Needs approval, from the Root. Children replace the word.',
      props: props<StatusOwnProps>({
        duration: { type: 'string', description: 'Elapsed time, e.g. 0.4 s, in mono.' },
      }),
      dataAttributes: { 'data-status': 'Mirrors the Root.' },
    },
    {
      name: 'Panel',
      element: 'div',
      base: 'Collapsible.Panel',
      slot: 'ToolCall.Panel',
      className: 'hj-tool-call-panel',
      description:
        'The details. The one layout transition: height via --collapsible-panel-height, clipped.',
    },
    {
      name: 'Section',
      element: 'section',
      slot: 'ToolCall.Section',
      className: 'hj-tool-call-section',
      description: 'A labelled block: Arguments, Result, Error.',
      props: props<SectionOwnProps>({
        label: { type: 'ReactNode', description: 'Eyebrow label.' },
      }),
    },
    {
      name: 'Code',
      element: 'pre',
      slot: 'ToolCall.Code',
      className: 'hj-tool-call-code',
      description:
        'Mono block; objects passed as value are shown as indented JSON. Scrolls past 220px.',
      props: props<CodeOwnProps>({
        value: { type: 'unknown', description: 'Shown as JSON (strings as-is). Children win.' },
      }),
    },
    {
      name: 'Approval',
      element: 'div',
      slot: 'ToolCall.Approval',
      className: 'hj-tool-call-approval',
      description:
        'What will happen + Approve / Deny, on a warning tint. The human-in-the-loop gate.',
    },
  ],
  examples: [
    {
      file: 'calls',
      title: 'Done, running and failed',
      description:
        'A search that worked, one still running and a fetch that failed with its error.',
    },
    {
      file: 'approval',
      title: 'Needs approval',
      description:
        'A purchase the assistant may not make on its own: what, how much, Approve or Deny.',
    },
  ],
  accessibility: [
    'The header is a button (Base UI Collapsible) with aria-expanded; the panel is labelled by it.',
    'Status is a word with a glyph and a tint — never colour alone.',
    'Approval actions are ordinary buttons: put the consequence in words before them (amount, recipient, what is deleted).',
  ],
  motion:
    'The chevron turns on snappy, clamped. The panel reveals its height on gentle, clamped and closes in 180 ms. Running shows the ink-ring spinner (a pulse under reduced motion).',
  tokens: [
    'bg-soft',
    'surface',
    'line',
    'success',
    'danger',
    'warning',
    'accent',
    'anim-spin',
    'ease-gentle-settle',
  ],
  related: ['message', 'reasoning', 'button'],
  baseUi: 'collapsible',
});
