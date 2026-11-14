'use client';
import * as React from 'react';

import type { HanjiIcon, IconProps } from './create-icon.tsx';
import { loaders } from './loaders.ts';
import type { IconName } from './names.ts';

const cache = new Map<string, HanjiIcon>();
const pending = new Map<string, Promise<HanjiIcon>>();
const table = loaders as Readonly<Record<string, (() => Promise<HanjiIcon>) | undefined>>;

/** True when `name` is one of hanji's icons. */
export function isIconName(name: string): name is IconName {
  return Object.hasOwn(loaders, name);
}

/** Load one icon by name; cached, and concurrent calls share one request. */
export function loadIcon(name: string): Promise<HanjiIcon> {
  const hit = cache.get(name);
  if (hit) return Promise.resolve(hit);
  const inflight = pending.get(name);
  if (inflight) return inflight;
  const load = table[name];
  if (!load) return Promise.reject(new Error(`[hanji] no icon named "${name}"`));
  const p = load().then((i) => {
    cache.set(name, i);
    pending.delete(name);
    return i;
  });
  pending.set(name, p);
  return p;
}

export interface DynamicIconProps extends IconProps {
  /** Any icon name, e.g. from data or a model's reply. Unknown names draw nothing. */
  name: IconName | (string & {});
}

/**
 * An icon chosen at runtime. Loads only that icon, and holds its box at full size while it
 * loads so nothing around it moves. Prefer importing `IconX` directly when the name is known.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps): React.JSX.Element {
  const [loaded, setLoaded] = React.useState<HanjiIcon | undefined>(undefined);
  const Icon = cache.get(name) ?? (loaded?.iconName === name ? loaded : undefined);
  React.useEffect(() => {
    if (cache.has(name) || !isIconName(name)) return;
    let live = true;
    loadIcon(name).then(
      (i) => {
        if (live) setLoaded(() => i);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, [name]);
  // A lookup in the module cache, not a component made during render: its identity is stable.
  // oxlint-disable-next-line react/static-components
  if (Icon) return <Icon {...props} />;
  const size = props.size ?? '1em';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      data-hj-icon-pending={name}
      className={props.className}
      style={props.style}
    />
  );
}
