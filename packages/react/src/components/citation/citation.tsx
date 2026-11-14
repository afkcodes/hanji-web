'use client';
import { PreviewCard as Base } from '@base-ui/react/preview-card';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

export const Root: typeof Base.Root = Base.Root;
export const Positioner: HanjiPart<typeof Base.Positioner> = part(
  Base.Positioner,
  'Citation.Positioner',
  'hj-citation-positioner',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'Citation.Popup',
  'hj-citation-popup',
);

/** Portals to `<body>` and keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

export interface TriggerOwnProps {
  /** The source's number, shown as the chip and used for the accessible label. */
  index: number;
}
export interface TriggerProps extends TriggerOwnProps, Base.Trigger.Props {}

/**
 * The inline `[1]` chip. Renders a link to the source (`href`); hovering or focusing it opens the
 * preview after a short delay.
 */
export function Trigger(props: TriggerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    index,
    className,
    children,
    delay = 350,
    ...rest
  } = withDefaults(config, 'Citation.Trigger', props);
  return (
    <Base.Trigger
      aria-label={`Source ${index}`}
      target="_blank"
      rel="noreferrer"
      {...rest}
      delay={delay}
      className={cls(config, 'Citation.Trigger', 'hj-citation-trigger', className)}
    >
      {children ?? index}
    </Base.Trigger>
  );
}

export interface ContentOwnProps {
  /** Gap between the chip and the card. @default 8 */
  sideOffset?: number;
  /** @default 'top' */
  side?: 'top' | 'bottom' | 'left' | 'right';
}
export interface ContentProps extends ContentOwnProps, Base.Popup.Props {}

/** Shorthand: Portal + Positioner + Popup — the source card. */
export function Content({
  sideOffset = 8,
  side = 'top',
  ...popup
}: ContentProps): React.ReactElement {
  return (
    <Portal>
      <Positioner sideOffset={sideOffset} side={side}>
        <Popup {...popup} />
      </Positioner>
    </Portal>
  );
}

/** The source's site, e.g. `example.com`, with its initial as a glyph. */
export function Domain(props: ElementPartProps<'div'>): React.ReactElement {
  const config = useHanjiConfig();
  const { className, children, render, ...rest } = withDefaults(config, 'Citation.Domain', props);
  const initial =
    typeof children === 'string'
      ? children
          .replace(/^www\./, '')
          .charAt(0)
          .toUpperCase()
      : '·';
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      className: cls(config, 'Citation.Domain', 'hj-citation-domain', className) as
        | string
        | undefined,
      children: (
        <>
          <span className={config.unstyled ? undefined : 'hj-citation-favicon'} aria-hidden="true">
            {initial}
          </span>
          {children}
        </>
      ),
    },
  });
}

export const Title: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Citation.Title',
  'hj-citation-title',
);
export const Snippet: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Citation.Snippet',
  'hj-citation-snippet',
);

/** The numbered list of sources under a reply. */
export const List: (props: ElementPartProps<'ol'>) => React.ReactElement = elementPart(
  'ol',
  'Citation.List',
  'hj-citation-list',
);

export interface ListItemOwnProps {
  index: number;
  /** Link to the source. */
  href?: string;
  /** Shown after the title, muted. */
  domain?: string;
}
export interface ListItemProps extends ListItemOwnProps, React.ComponentProps<'li'> {}

/** One source in Citation.List: number, title, domain. */
export function ListItem(props: ListItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const { index, href, domain, className, children, ...rest } = withDefaults(
    config,
    'Citation.ListItem',
    props,
  );
  const styled = !config.unstyled;
  const body = (
    <>
      <span className={styled ? 'hj-citation-list-index' : undefined}>{index}</span>
      <span className={styled ? 'hj-citation-list-title' : undefined}>{children}</span>
      {domain ? (
        <span className={styled ? 'hj-citation-list-domain' : undefined}>{domain}</span>
      ) : null}
    </>
  );
  return (
    <li
      {...rest}
      className={
        cls(config, 'Citation.ListItem', 'hj-citation-list-item', className) as string | undefined
      }
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={styled ? 'hj-citation-list-link' : undefined}
        >
          {body}
        </a>
      ) : (
        body
      )}
    </li>
  );
}
