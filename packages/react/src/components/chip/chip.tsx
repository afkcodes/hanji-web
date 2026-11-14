'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { msVar, useFlip } from '../../system/flip.ts';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** Attribute changes that move a chip row: a check appearing, a chip leaving. */
const CHIP_ATTRS = ['data-pressed', 'data-leaving'] as const;

/** Point a forwarded ref at a node (callback or object form). */
function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as React.RefObject<T | null>).current = node;
}

/* ---------------------------------------------------------------------------------------------
 * Root — a filter chip (Base UI Toggle)
 * ------------------------------------------------------------------------------------------- */

/** Props hanji adds to a filter chip. */
export interface RootOwnProps {
  /** md 32 (hanji) · sm 28. */
  size?: 'sm' | 'md';
  /** A leading glyph. */
  icon?: React.ReactNode;
  /** Show a check that scales in when selected. @default true */
  check?: boolean;
}

export interface RootProps extends RootOwnProps, BaseToggle.Props {}

/**
 * A filter the user turns on and off. Off: surface + hairline + dim ink. On: accent-soft with
 * accent ink and a check that scales in. Inside Chip.Group it becomes one of a set.
 *
 * @example
 * <Chip.Group multiple defaultValue={['albums']}>
 *   <Chip.Root value="albums">Albums</Chip.Root>
 *   <Chip.Root value="playlists">Playlists</Chip.Root>
 * </Chip.Group>
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    icon,
    check = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Chip.Root', props);
  const styled = !config.unstyled;
  return (
    <BaseToggle
      {...rest}
      data-kind="filter"
      data-size={size}
      className={cls(config, 'Chip.Root', 'hj-chip', className)}
    >
      {check ? (
        <span className={styled ? 'hj-chip-check' : undefined} aria-hidden="true">
          {config.icons.check}
        </span>
      ) : null}
      {icon ? (
        <span className={styled ? 'hj-chip-icon' : undefined} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styled ? 'hj-chip-label' : undefined}>{children}</span>
    </BaseToggle>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Group — a set of filter chips (Base UI ToggleGroup)
 * ------------------------------------------------------------------------------------------- */

export interface GroupProps extends BaseToggleGroup.Props {}

/** A set of filter chips: single choice by default, `multiple` for any combination. Arrow keys move between chips. */
export function Group(props: GroupProps): React.ReactElement {
  const config = useHanjiConfig();
  const { className, ref, ...rest } = withDefaults(config, 'Chip.Group', props);
  const own = React.useRef<HTMLDivElement>(null);
  const merged = (node: HTMLDivElement | null): void => {
    own.current = node;
    assignRef(ref as React.Ref<HTMLDivElement> | undefined, node);
  };
  useFlip(own, CHIP_ATTRS);
  return (
    <BaseToggleGroup
      {...rest}
      ref={merged}
      className={cls(config, 'Chip.Group', 'hj-chip-group', className)}
    />
  );
}

/* ---------------------------------------------------------------------------------------------
 * List — a wrapping row for input chips, with the same glide when one leaves
 * ------------------------------------------------------------------------------------------- */

export interface ListOwnProps {
  render?: useRender.RenderProp;
}
export interface ListProps extends ListOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
}

/** A wrapping row of input chips. When one is removed the rest glide into place, settled — no bounce. */
export function List(props: ListProps): React.ReactElement {
  const config = useHanjiConfig();
  const { render, className, ref, ...rest } = withDefaults(config, 'Chip.List', props);
  const own = React.useRef<HTMLDivElement>(null);
  useFlip(own, CHIP_ATTRS);
  return useRender({
    render,
    ref: ref ? [own, ref] : own,
    defaultTagName: 'div',
    props: {
      ...rest,
      className: cls(config, 'Chip.List', 'hj-chip-list', className) as string | undefined,
    },
  });
}

/* ---------------------------------------------------------------------------------------------
 * Input — a value the user picked, with a remove button
 * ------------------------------------------------------------------------------------------- */

/** Props hanji adds to an input chip. */
export interface InputOwnProps {
  /** Called after the chip has faded out (180 ms; faster under reduced motion). Remove it from your state here. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Default: “Remove {children}”. */
  removeLabel?: string;
  size?: 'sm' | 'md';
  /** A leading glyph or tiny avatar. */
  icon?: React.ReactNode;
  disabled?: boolean;
  render?: useRender.RenderProp;
}

export interface InputProps extends InputOwnProps, Omit<React.ComponentProps<'span'>, 'className'> {
  className?: string;
}

/**
 * A picked value (a search filter, a recipient) with a ✕. Removing fades it out fast, moves focus
 * to the next chip's ✕ (or the previous), then calls `onRemove`.
 */
export function Input(props: InputProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    onRemove,
    removeLabel,
    size = 'md',
    icon,
    disabled = false,
    render,
    className,
    children,
    ref,
    ...rest
  } = withDefaults(config, 'Chip.Input', props);
  const own = React.useRef<HTMLSpanElement>(null);
  const [leaving, setLeaving] = React.useState(false);
  const styled = !config.unstyled;
  const label =
    removeLabel ??
    `${config.strings.remove} ${typeof children === 'string' || typeof children === 'number' ? children : ''}`.trim();

  const remove = (): void => {
    const el = own.current;
    if (leaving || disabled || !el) return;
    // Hand focus to a neighbour's ✕ before this chip disappears.
    const all = [
      ...(el.parentElement?.querySelectorAll<HTMLButtonElement>('[data-chip-remove]') ?? []),
    ];
    const mine = el.querySelector<HTMLButtonElement>('[data-chip-remove]');
    const i = mine ? all.indexOf(mine) : -1;
    const next = all[i + 1] ?? all[i - 1] ?? null;
    setLeaving(true);
    const wait = msVar(getComputedStyle(el), '--hj-dur-fast', 180);
    window.setTimeout(() => {
      next?.focus();
      onRemove?.();
    }, wait);
  };

  return useRender({
    render,
    ref: ref ? [own, ref] : own,
    defaultTagName: 'span',
    props: {
      ...rest,
      'data-kind': 'input',
      'data-size': size,
      'data-leaving': flag(leaving),
      'data-disabled': flag(disabled),
      className: cls(config, 'Chip.Input', 'hj-chip', className) as string | undefined,
      children: (
        <>
          {icon ? (
            <span className={styled ? 'hj-chip-icon' : undefined} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className={styled ? 'hj-chip-label' : undefined}>{children}</span>
          <button
            type="button"
            className={styled ? 'hj-chip-remove' : undefined}
            aria-label={label}
            disabled={disabled}
            data-chip-remove=""
            onClick={remove}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                remove();
              }
            }}
          >
            {config.icons.x}
          </button>
        </>
      ),
    },
  });
}

/* ---------------------------------------------------------------------------------------------
 * Action — an assist chip: a small, suggested action with a glyph
 * ------------------------------------------------------------------------------------------- */

/** Props hanji adds to an action chip. */
export interface ActionOwnProps {
  size?: 'sm' | 'md';
  /** The glyph that names the action. */
  icon?: React.ReactNode;
}

export interface ActionProps extends ActionOwnProps, BaseButton.Props {}

/** A suggested action next to content (Add to queue, Start radio, Share). Hairline, ink, glyph first. */
export function Action(props: ActionProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    icon,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Chip.Action', props);
  const styled = !config.unstyled;
  return (
    <BaseButton
      {...rest}
      data-kind="action"
      data-size={size}
      className={cls(config, 'Chip.Action', 'hj-chip', className)}
    >
      {icon ? (
        <span className={styled ? 'hj-chip-icon' : undefined} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styled ? 'hj-chip-label' : undefined}>{children}</span>
    </BaseButton>
  );
}
