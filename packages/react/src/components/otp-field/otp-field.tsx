'use client';
import { OTPField as Base } from '@base-ui/react/otp-field';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** A dash between groups of cells, e.g. 3 – 3. */
export const Separator: HanjiPart<typeof Base.Separator> = part(
  Base.Separator,
  'OTPField.Separator',
  'hj-otp-field-separator',
);

export interface RootOwnProps {
  /** error: wrong code (danger ring, one nudge) · success: accepted (success tint). */
  status?: 'idle' | 'error' | 'success';
  /** Cell size: md 48×56 (default), sm 40×48. */
  size?: 'sm' | 'md';
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * A one-time code, one character per cell. With no children it renders `length` cells and
 * labels them; a paste fills the cells in a 24 ms cascade.
 *
 * @example <OTPField.Root length={6} onValueComplete={verify} />
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    status = 'idle',
    size = 'md',
    className,
    children,
    onValueChange,
    length,
    ...rest
  } = withDefaults(config, 'OTPField.Root', props);
  const [pasting, setPasting] = React.useState(false);
  React.useEffect(() => {
    if (!pasting) return undefined;
    const t = window.setTimeout(() => setPasting(false), 600);
    return () => window.clearTimeout(t);
  }, [pasting]);
  const handleChange: Base.Root.Props['onValueChange'] = (value, details) => {
    if (details.reason === 'input-paste') setPasting(true);
    onValueChange?.(value, details);
  };
  return (
    <Base.Root
      {...rest}
      length={length}
      onValueChange={handleChange}
      data-status={status === 'idle' ? undefined : status}
      data-size={size}
      data-pasting={pasting ? '' : undefined}
      className={cls(config, 'OTPField.Root', 'hj-otp-field', className)}
    >
      {children ??
        Array.from({ length }, (_, i) => (
          <Input
            // oxlint-disable-next-line react/no-array-index-key -- cells are positional
            key={i}
            aria-label={i === 0 ? undefined : config.strings.characterOf(i + 1, length)}
          />
        ))}
    </Base.Root>
  );
}

/** One cell. Its position in the paste cascade comes from its order among the cells. */
export const Input: HanjiPart<typeof Base.Input> = part(
  Base.Input,
  'OTPField.Input',
  'hj-otp-field-input',
);
