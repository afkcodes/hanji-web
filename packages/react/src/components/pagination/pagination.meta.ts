import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { PageOwnProps, PagesOwnProps, RootOwnProps, SummaryOwnProps } from './pagination.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Pagination',
  slug: 'pagination',
  category: 'navigation',
  status: 'new',
  description: 'Moves through numbered pages of a long list or table.',
  whenToUse: [
    'Tables and search results where position matters and people come back to page 4.',
    'compact on narrow layouts or inside a toolbar.',
  ],
  whenNotToUse: [
    'Feeds people scroll — load more as they reach the end.',
    'A handful of items — show them all.',
  ],
  import: "import { Pagination } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'nav',
      slot: 'Pagination.Root',
      className: 'hj-pagination-root',
      description:
        'Owns the page. With no children it renders Previous, Pages (or Summary) and Next.',
      props: props<RootOwnProps>({
        count: { type: 'number', description: 'Total pages.' },
        page: { type: 'number', description: 'Current page, 1-based (controlled).' },
        defaultPage: { type: 'number', default: '1', description: 'Initial page (uncontrolled).' },
        onPageChange: { type: '(page: number) => void', description: 'Called with the new page.' },
        siblings: {
          type: 'number',
          default: '1',
          description: 'Pages either side of the current one.',
        },
        boundaries: {
          type: 'number',
          default: '1',
          description: 'Pages always shown at each end.',
        },
        variant: {
          type: "'full' | 'compact'",
          default: "'full'",
          description: 'Numbered pages, or “3 of 12”.',
        },
        getHref: {
          type: '(page: number) => string',
          description: 'Render pages as real links (crawlable, open-in-new-tab).',
        },
      }),
      dataAttributes: { 'data-variant': 'full | compact' },
      cssVars: { '--hj-pagination-size': 'Button size. Default 36px (44px hit area).' },
    },
    {
      name: 'Pages',
      element: 'ol',
      slot: 'Pagination.Pages',
      className: 'hj-pagination-pages',
      description: 'Numbered pages with ellipses; constant length so the row never jumps.',
      props: props<PagesOwnProps>({
        siblings: {
          type: 'number',
          default: '1',
          description: 'Pages either side of the current one.',
        },
        boundaries: {
          type: 'number',
          default: '1',
          description: 'Pages always shown at each end.',
        },
      }),
    },
    {
      name: 'Page',
      element: 'button',
      slot: 'Pagination.Page',
      className: 'hj-pagination-page',
      description: 'One page. Current = accent on accent-soft, aria-current="page".',
      props: props<PageOwnProps>({
        value: { type: 'number', description: 'The page it goes to.' },
      }),
      dataAttributes: { 'data-current': 'The current page.' },
    },
    {
      name: 'Previous',
      element: 'button',
      slot: 'Pagination.Previous',
      className: 'hj-pagination-step',
      description: 'Back one page; disabled on the first. Children replace the chevron.',
      dataAttributes: { 'data-disabled': 'At the first page.' },
    },
    {
      name: 'Next',
      element: 'button',
      slot: 'Pagination.Next',
      className: 'hj-pagination-step',
      description: 'Forward one page; disabled on the last.',
      dataAttributes: { 'data-disabled': 'At the last page.' },
    },
    {
      name: 'Summary',
      element: 'span',
      slot: 'Pagination.Summary',
      className: 'hj-pagination-summary',
      description: '“3 of 12” in tabular figures, announced politely.',
      props: props<SummaryOwnProps>({
        format: {
          type: '(page, count) => ReactNode',
          default: '`${page} of ${count}`',
          description: 'Localise or reword.',
        },
      }),
    },
  ],
  examples: [
    {
      file: 'table',
      title: 'Under a table',
      description: '24 pages from page 7; edges disabled at the ends.',
    },
    {
      file: 'compact',
      title: 'Compact and links',
      description: 'A compact pager, and a short one rendered as links.',
    },
  ],
  accessibility: [
    'A <nav> landmark (default label “Pagination” — override for i18n).',
    'Each page is labelled “Page 7”; the current one has aria-current="page".',
    'Previous/Next stay in the tab order when disabled (aria-disabled) so focus never jumps.',
    'Every target is 36px drawn with a 44px hit area.',
  ],
  motion: 'Press dips to .97 in 70 ms; the current page changes colour on a 180 ms ease-out.',
  tokens: ['accent', 'accent-soft', 'fg-dim', 'fg-mute', 'radius-pill'],
  related: ['table', 'steps'],
});
