'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

export type EmptyStateVariant = 'empty' | 'no-results' | 'offline' | 'error';

const VariantContext = React.createContext<EmptyStateVariant>('empty');

/** Says what is missing. Renders `<h3>`; use `render={<h2 />}` to fit the page outline. */
export const Title: (props: ElementPartProps<'h3'>) => React.ReactElement = elementPart(
  'h3',
  'EmptyState.Title',
  'hj-empty-state-title',
);
/** One sentence: why it is empty and what to do about it. */
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'EmptyState.Description',
  'hj-empty-state-description',
);
/** The way out: one primary action, at most one quiet one. */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'EmptyState.Actions',
  'hj-empty-state-actions',
);

export interface RootOwnProps {
  /** empty = nothing yet · no-results = a search or filter found nothing · offline · error. */
  variant?: EmptyStateVariant;
  /** center for a whole region; start inside a column or a card. */
  align?: 'center' | 'start';
}
export type RootProps = RootOwnProps & ElementPartProps<'div'>;

/** What fills the room when there is nothing to show: a glyph, a title, one sentence, an action. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    variant = 'empty',
    align = 'center',
    render,
    className,
    ...rest
  } = withDefaults(config, 'EmptyState.Root', props);
  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: variant === 'error' || variant === 'offline' ? 'status' : undefined,
      ...rest,
      'data-variant': variant,
      'data-align': align,
      className: cls(config, 'EmptyState.Root', 'hj-empty-state', className) as string | undefined,
    },
  });
  return <VariantContext.Provider value={variant}>{element}</VariantContext.Provider>;
}

const svg = (d: string): React.ReactElement => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d={d} />
  </svg>
);

/** Tray: nothing here yet. */
const TRAY = svg(
  'M3 13.5 5.6 5.2A2 2 0 0 1 7.5 3.8h9a2 2 0 0 1 1.9 1.4L21 13.5M3 13.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.5M3 13.5h5l1.5 2.5h5l1.5-2.5h5',
);
/** Wi-Fi with a stroke through it. */
const OFFLINE = svg(
  'm2 2 20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.2-1.6M1.4 9a15 15 0 0 1 4.3-2.9M22.6 9A15 15 0 0 0 10.7 5M12 20h.01',
);

/** The glyph in a soft disc. With no children it draws the variant's own glyph. */
export function Glyph(props: ElementPartProps<'span'>): React.ReactElement {
  const config = useHanjiConfig();
  const variant = React.useContext(VariantContext);
  const { render, className, children, ...rest } = withDefaults(config, 'EmptyState.Glyph', props);
  const fallback =
    variant === 'no-results'
      ? config.icons.search
      : variant === 'error'
        ? config.icons.alert
        : variant === 'offline'
          ? OFFLINE
          : TRAY;
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      'aria-hidden': true,
      ...rest,
      className: cls(config, 'EmptyState.Glyph', 'hj-empty-state-glyph', className) as
        | string
        | undefined,
      children: children ?? fallback,
    },
  });
}
