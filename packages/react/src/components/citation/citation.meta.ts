import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ContentOwnProps, ListItemOwnProps, TriggerOwnProps } from './citation.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Citation',
  slug: 'citation',
  category: 'ai',
  status: 'new',
  description:
    'An inline numbered source in a reply, with a preview card of the source on hover or focus.',
  whenToUse: [
    'Grounding an assistant’s claim in a source the person can check.',
    'The list of sources under a reply (Citation.List).',
  ],
  whenNotToUse: [
    'Ordinary links in prose — use a link.',
    'Rich previews of arbitrary URLs — use a PreviewCard directly.',
  ],
  import: "import { Citation } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: '(none)',
      base: 'PreviewCard.Root',
      slot: 'Citation.Root',
      className: '',
      description: 'Owns the open state of one source preview.',
    },
    {
      name: 'Trigger',
      element: 'a',
      base: 'PreviewCard.Trigger',
      slot: 'Citation.Trigger',
      className: 'hj-citation-trigger',
      description: 'The inline [n] chip: a link to the source that previews it after 350 ms.',
      props: props<TriggerOwnProps>({
        index: { type: 'number', description: 'The number shown, and “Source n” as its label.' },
      }),
      dataAttributes: { 'data-popup-open': 'Preview is open (Base UI).' },
    },
    {
      name: 'Content',
      element: '(portal)',
      slot: 'Citation.Popup',
      className: 'hj-citation-popup',
      description: 'Shorthand: Portal + Positioner + Popup — the source card. Grows from the chip.',
      props: props<ContentOwnProps>({
        sideOffset: { type: 'number', default: '8', description: 'Gap to the chip.' },
        side: {
          type: "'top' | 'bottom' | 'left' | 'right'",
          default: "'top'",
          description: 'Preferred side.',
        },
      }),
      cssVars: { '--hj-citation-width': 'Card width. Default 300px.' },
    },
    {
      name: 'Portal',
      element: '(portal)',
      base: 'PreviewCard.Portal',
      slot: 'Citation.Portal',
      className: '',
      description: 'Keeps the nearest Theme.',
    },
    {
      name: 'Positioner',
      element: 'div',
      base: 'PreviewCard.Positioner',
      slot: 'Citation.Positioner',
      className: 'hj-citation-positioner',
      description: 'Anchors the card.',
    },
    {
      name: 'Popup',
      element: 'div',
      base: 'PreviewCard.Popup',
      slot: 'Citation.Popup',
      className: 'hj-citation-popup',
      description: 'The card surface: surface-2, hairline, lift.',
    },
    {
      name: 'Domain',
      element: 'div',
      slot: 'Citation.Domain',
      className: 'hj-citation-domain',
      description: 'Site name with its initial as a small glyph.',
    },
    {
      name: 'Title',
      element: 'div',
      slot: 'Citation.Title',
      className: 'hj-citation-title',
      description: 'The source title.',
    },
    {
      name: 'Snippet',
      element: 'p',
      slot: 'Citation.Snippet',
      className: 'hj-citation-snippet',
      description: 'The quoted passage, clamped to three lines.',
    },
    {
      name: 'List',
      element: 'ol',
      slot: 'Citation.List',
      className: 'hj-citation-list',
      description: 'All sources under a reply.',
    },
    {
      name: 'ListItem',
      element: 'li',
      slot: 'Citation.ListItem',
      className: 'hj-citation-list-item',
      description: 'Number, title, domain — a link when href is given.',
      props: props<ListItemOwnProps>({
        index: { type: 'number', description: 'Matches the inline chip.' },
        href: { type: 'string', description: 'Link to the source (opens in a new tab).' },
        domain: { type: 'string', description: 'Shown muted after the title.' },
      }),
    },
  ],
  examples: [
    {
      file: 'inline',
      title: 'Inline sources',
      description: 'Two numbered chips in an answer, and the source list under it.',
    },
    {
      file: 'missing',
      title: 'A source that couldn’t load',
      description: 'The card says what is missing instead of showing an empty preview.',
    },
  ],
  accessibility: [
    'The chip is a real link labelled “Source n”; Enter follows it, focus opens the preview.',
    'The preview is supplementary (Base UI PreviewCard): everything in it is reachable through the link itself.',
    'Never put the only copy of important information in the card.',
  ],
  motion:
    'The card grows from the chip (transform-origin) on snappy, clamped; it leaves in 180 ms. The chip tints on hover.',
  tokens: ['surface', 'surface-2', 'line', 'accent', 'accent-soft', 'shadow-lift', 'radius-md'],
  related: ['message', 'streaming-text'],
  baseUi: 'preview-card',
});
