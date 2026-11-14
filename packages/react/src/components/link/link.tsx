'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** Props hanji adds to `<a>`. */
export interface LinkOwnProps {
  /** accent for links in running text; fg for quiet links in chrome; dim for footnotes. */
  tone?: 'accent' | 'fg' | 'dim';
  /** always = underlined at rest (running text); hover = underline appears on hover (chrome). */
  underline?: 'always' | 'hover';
  /**
   * Opens in a new tab: adds target and rel, a ↗ glyph, and a visually hidden note for screen
   * readers.
   */
  external?: boolean;
  /** The hidden note read after an external link. @default strings.opensInNewTab */
  externalLabel?: string;
  /** Render a router link (e.g. `render={<RouterLink to="/library" />}`). */
  render?: useRender.RenderProp;
}

export interface LinkProps extends LinkOwnProps, Omit<React.ComponentProps<'a'>, 'className'> {
  className?: string;
}

function ArrowUpRight(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

/**
 * A link: goes somewhere. Underline offset and thickness set for reading; the underline slides
 * its colour, never its position.
 *
 * @example
 * <Link href="/terms">terms of service</Link>
 * <Link href="https://help.example.com" external>Help centre</Link>
 */
export function Link(props: LinkProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    tone = 'accent',
    underline = 'always',
    external = false,
    externalLabel = config.strings.opensInNewTab,
    render,
    className,
    children,
    target,
    rel,
    ...rest
  } = withDefaults(config, 'Link', props);
  const styled = !config.unstyled;
  return useRender({
    render,
    defaultTagName: 'a',
    props: {
      ...rest,
      target: external ? (target ?? '_blank') : target,
      rel: external ? (rel ?? 'noopener noreferrer') : rel,
      'data-tone': tone,
      'data-underline': underline,
      'data-external': flag(external),
      className: cls(config, 'Link', 'hj-link', className) as string | undefined,
      children: external ? (
        <>
          {children}
          <span className={styled ? 'hj-link-glyph' : undefined}>
            <ArrowUpRight />
          </span>
          <span className={styled ? 'hj-link-note' : undefined}>{` (${externalLabel})`}</span>
        </>
      ) : (
        children
      ),
    },
  });
}
