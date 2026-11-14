'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export interface RootOwnProps {
  /**
   * Collapse when there are more items than this: keep the first and the last `maxItems − 1`,
   * and put a “…” button in between that reveals the rest in place (no menu).
   */
  maxItems?: number;
  /** Separator between items. Defaults to the adapter's chevronRight. */
  separator?: React.ReactNode;
  /** Accessible label of the “…” button. @default (n) => `Show ${n} more` */
  expandLabel?: (hidden: number) => string;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'nav'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * Where this page sits. A labelled <nav> holding an ordered list; children are Breadcrumbs.Item.
 * Give it aria-label="Breadcrumb".
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    maxItems,
    separator,
    expandLabel = (n: number) => `Show ${n} more`,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Breadcrumbs.Root', props);
  const [expanded, setExpanded] = React.useState(false);
  const styled = !config.unstyled;
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const collapse = maxItems !== undefined && !expanded && items.length > Math.max(2, maxItems);
  const tail = collapse ? Math.max(1, (maxItems ?? 2) - 1) : 0;
  const hidden = collapse ? items.length - 1 - tail : 0;
  const shown: React.ReactNode[] = collapse
    ? [
        items[0],
        <li key="hj-collapse" className={styled ? 'hj-breadcrumbs-item' : undefined}>
          <button
            type="button"
            className={styled ? 'hj-breadcrumbs-collapse' : undefined}
            aria-label={expandLabel(hidden)}
            onClick={() => setExpanded(true)}
          >
            …
          </button>
        </li>,
        ...items.slice(items.length - tail),
      ]
    : items;
  const sep = separator ?? config.icons.chevronRight;
  const list = shown.flatMap((node, i) =>
    i === 0
      ? [node]
      : [
          <li
            key={`hj-sep-${String((node as React.ReactElement).key)}`}
            className={styled ? 'hj-breadcrumbs-separator' : undefined}
            aria-hidden="true"
          >
            {sep}
          </li>,
          node,
        ],
  );
  return useRender({
    render,
    defaultTagName: 'nav',
    props: {
      ...rest,
      'data-collapsed': flag(collapse),
      className: cls(config, 'Breadcrumbs.Root', 'hj-breadcrumbs-root', className) as
        | string
        | undefined,
      children: <ol className={styled ? 'hj-breadcrumbs-list' : undefined}>{list}</ol>,
    },
  });
}

export interface ItemOwnProps {
  /** This page. Rendered as text with aria-current="page", not a link. */
  current?: boolean;
  /** Where the crumb goes. Omit with `current`. */
  href?: string;
}
export interface ItemProps
  extends ItemOwnProps, Omit<React.ComponentProps<'a'>, 'className' | 'href'> {
  className?: string;
  /** Render your router's Link instead of <a>. */
  render?: useRender.RenderProp;
}

/** One crumb: a link, or the current page as plain text. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    current = false,
    href,
    render,
    className,
    ...rest
  } = withDefaults(config, 'Breadcrumbs.Item', props);
  const inner = useRender({
    render: current ? undefined : render,
    defaultTagName: current ? 'span' : 'a',
    props: {
      ...rest,
      href: current ? undefined : href,
      'aria-current': current ? 'page' : undefined,
      'data-current': flag(current),
      className: cls(config, 'Breadcrumbs.Item', 'hj-breadcrumbs-link', className) as
        | string
        | undefined,
    },
  });
  return <li className={config.unstyled ? undefined : 'hj-breadcrumbs-item'}>{inner}</li>;
}
