'use client';
import { Avatar as Base } from '@base-ui/react/avatar';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

export type AvatarSize = 24 | 32 | 40 | 56;
export type Presence = 'online' | 'away' | 'busy' | 'offline';

const SizeContext = React.createContext<AvatarSize | null>(null);

/** Two initials from a name: “Jun-seo Park” → JP, “Mira” → M. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return (first + last).toLocaleUpperCase();
}

/** A stable 1–6 tint index from a name (FNV-1a), so a person keeps their colour everywhere. */
export function tintFor(name: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 6) + 1;
}

export const Image: HanjiPart<typeof Base.Image> = part(
  Base.Image,
  'Avatar.Image',
  'hj-avatar-image',
);
export const Fallback: HanjiPart<typeof Base.Fallback> = part(
  Base.Fallback,
  'Avatar.Fallback',
  'hj-avatar-fallback',
);

/** Props hanji adds to Base UI's Avatar.Root. */
export interface RootOwnProps {
  /** The person or thing. Drives the initials, the tint and the image alt text. */
  name?: string;
  /** Image URL. With `name` and no children, Root renders Image + Fallback for you. */
  src?: string;
  /** 24 (dense lists) · 32 (rows) · 40 (default) · 56 (profiles). Inherits from Avatar.Group. */
  size?: AvatarSize;
  /** A presence dot in the corner, with its word for screen readers. */
  presence?: Presence;
  /** The word read for presence. Defaults to the presence value, capitalised. */
  presenceLabel?: string;
}

export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * A person, as a picture or their initials on a tint that is theirs. Initials appear only if the
 * picture is slow or fails, so a fast image never flashes letters.
 *
 * @example
 * <Avatar.Root name="Mira Okafor" src="/mira.jpg" presence="online" />
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const inherited = React.useContext(SizeContext);
  const { name, src, size, presence, presenceLabel, className, children, ...rest } = withDefaults(
    config,
    'Avatar.Root',
    props,
  );
  const resolved = size ?? inherited ?? 40;
  const styled = !config.unstyled;
  const body = children ?? (
    <>
      {src ? <Image src={src} alt={name ?? ''} /> : null}
      <Fallback delay={src ? 600 : 0}>{name ? initials(name) : null}</Fallback>
    </>
  );
  return (
    <Base.Root
      {...rest}
      data-size={resolved}
      data-tint={name ? tintFor(name) : undefined}
      className={cls(config, 'Avatar.Root', 'hj-avatar', className)}
    >
      {body}
      {presence ? (
        <span className={styled ? 'hj-avatar-presence' : undefined} data-presence={presence}>
          <span className={styled ? 'hj-avatar-presence-label' : undefined}>
            {presenceLabel ?? presence.charAt(0).toUpperCase() + presence.slice(1)}
          </span>
        </span>
      ) : null}
    </Base.Root>
  );
}

/** Props hanji adds to a group of avatars. */
export interface GroupOwnProps {
  /** Show this many, then a “+N” bubble for the rest. */
  max?: number;
  /** Size for every avatar in the group (each can still override). @default 32 */
  size?: AvatarSize;
  /** Accessible summary, e.g. “Mira, Jun-seo and 4 others”. */
  label?: string;
  render?: useRender.RenderProp;
}

export interface GroupProps extends GroupOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
}

/** Overlapping avatars with a paper ring between them, and +N for the rest. */
export function Group(props: GroupProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    max,
    size = 32,
    label,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Avatar.Group', props);
  const all = React.Children.toArray(children);
  const shown = max !== undefined && max >= 0 && all.length > max ? all.slice(0, max) : all;
  const extra = all.length - shown.length;
  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'group',
      'aria-label': label,
      ...rest,
      'data-size': size,
      className: cls(config, 'Avatar.Group', 'hj-avatar-group', className) as string | undefined,
      children: (
        <>
          {shown}
          {extra > 0 ? (
            <span
              className={config.unstyled ? undefined : 'hj-avatar-more'}
              data-size={size}
              aria-label={`${extra} more`}
            >
              +{extra}
            </span>
          ) : null}
        </>
      ),
    },
  });
  return <SizeContext.Provider value={size}>{element}</SizeContext.Provider>;
}
