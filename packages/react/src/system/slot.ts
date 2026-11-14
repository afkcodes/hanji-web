import type { HanjiConfig } from './config.tsx';

/** Base UI's className: a string, or a function of the part's state. */
export type ClassName<State> = string | ((state: State) => string | undefined) | undefined;

const join = (a: string, b: string | undefined): string => (b ? (a ? `${a} ${b}` : b) : a);

/**
 * Resolve a part's class: hanji's class (unless unstyled) + the provider's slot class + the
 * call site's class. Keeps Base UI's function form when the caller passed a function.
 *
 * @param slot  the slot name used by `HanjiProvider.classNames`, e.g. `'Dialog.Popup'`
 * @param base  hanji's class for the part, e.g. `'hj-dialog-popup'`
 */
export function cls<State>(
  config: HanjiConfig,
  slot: string,
  base: string,
  className: ClassName<State>,
): ClassName<State> {
  const own = join(config.unstyled ? '' : base, config.classNames[slot]);
  if (typeof className === 'function') {
    return (state: State): string => join(own, className(state) ?? undefined);
  }
  return join(own, className) || undefined;
}

/**
 * Merge provider defaults under call-site props. Returns the same object when the slot has no
 * defaults, so the common path allocates nothing.
 */
export function withDefaults<P extends object>(config: HanjiConfig, slot: string, props: P): P {
  const d = config.defaults[slot];
  return d ? ({ ...d, ...props } as P) : props;
}

/** `data-*` boolean: present when true, absent otherwise (so CSS can use `[data-x]`). */
export function flag(value: boolean | undefined): '' | undefined {
  return value ? '' : undefined;
}
