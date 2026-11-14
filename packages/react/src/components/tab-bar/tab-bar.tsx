'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** The active value. A primitive, so the context never changes identity without a reason. */
const ValueContext = React.createContext<string | undefined>(undefined);
const VALUE_ATTR = 'data-hj-tab-value';

export interface RootOwnProps {
  /** The active item's value (controlled). */
  value?: string;
  /** The initially active item's value (uncontrolled). */
  defaultValue?: string;
  /** Called with an item's value when it is pressed. */
  onValueChange?: (value: string) => void;
  /** Pin to the bottom of the viewport (position: fixed). Off: you place it. */
  fixed?: boolean;
}
export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'nav'>, 'className' | 'defaultValue'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * The mobile-web bottom bar: up to five equal destinations, icon over label. Plain on purpose —
 * nothing raised in the middle. Give it an aria-label.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    value,
    defaultValue,
    onValueChange,
    fixed = false,
    render,
    className,
    ...rest
  } = withDefaults(config, 'TabBar.Root', props);
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  // One delegated listener for every item: the item says which value it is with an attribute.
  const select = (e: React.MouseEvent<HTMLElement>): void => {
    rest.onClick?.(e as React.MouseEvent<HTMLElement>);
    if (e.defaultPrevented) return;
    const item = (e.target as Element).closest(`[${VALUE_ATTR}]`);
    const v = item && e.currentTarget.contains(item) ? item.getAttribute(VALUE_ATTR) : null;
    if (v === null) return;
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  const element = useRender({
    render,
    defaultTagName: 'nav',
    props: {
      ...rest,
      onClick: select,
      'data-fixed': flag(fixed),
      className: cls(config, 'TabBar.Root', 'hj-tab-bar-root', className) as string | undefined,
    },
  });
  return <ValueContext.Provider value={current}>{element}</ValueContext.Provider>;
}

export interface ItemOwnProps {
  /** Identifies the item for Root's value. */
  value?: string;
  /** Force the active state (e.g. from your router). Overrides Root's value. */
  active?: boolean;
  /** The glyph, 24px. */
  icon: React.ReactNode;
  /** A count (18px pill, 99+) or `true` for a dot. */
  badge?: number | boolean;
}
export interface ItemProps
  extends ItemOwnProps, Omit<React.ComponentProps<'button'>, 'className' | 'value'> {
  className?: string;
  /** Render a link (`<a href>`, your router's Link) instead of a button. */
  render?: useRender.RenderProp;
}

/**
 * One destination. A button by default; pass `render={<a href="/library" />}` for a link.
 * The active item is accent and carries aria-current="page"; its icon settles once on a
 * small bouncy spring when it becomes active.
 */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const rootValue = React.useContext(ValueContext);
  const { value, active, icon, badge, render, className, children, ...rest } = withDefaults(
    config,
    'TabBar.Item',
    props,
  );
  const isActive = active ?? (value !== undefined && rootValue === value);
  // Settle once when the item *becomes* active — derived during render, never on mount.
  const [prevActive, setPrevActive] = React.useState(isActive);
  const [settling, setSettling] = React.useState(false);
  if (prevActive !== isActive) {
    setPrevActive(isActive);
    if (isActive) setSettling(true);
  }

  const styled = !config.unstyled;
  const count = typeof badge === 'number' ? (badge > 99 ? '99+' : String(badge)) : null;
  const badgeLabel = typeof badge === 'number' ? `, ${badge} new` : badge ? ', new' : '';

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: render ? undefined : 'button',
      ...rest,
      'aria-current': isActive ? 'page' : undefined,
      'data-active': flag(isActive),
      [VALUE_ATTR]: value,
      className: cls(config, 'TabBar.Item', 'hj-tab-bar-item', className) as string | undefined,
      children: (
        <>
          <span
            className={styled ? 'hj-tab-bar-icon' : undefined}
            data-settling={flag(settling)}
            onAnimationEnd={() => setSettling(false)}
            aria-hidden="true"
          >
            {icon}
            {badge ? (
              <span
                className={styled ? 'hj-tab-bar-badge' : undefined}
                data-dot={flag(count === null)}
              >
                {count}
              </span>
            ) : null}
          </span>
          <span className={styled ? 'hj-tab-bar-label' : undefined}>
            {children}
            {badgeLabel ? <span className="hj-sr-only">{badgeLabel}</span> : null}
          </span>
        </>
      ),
    },
  });
}
