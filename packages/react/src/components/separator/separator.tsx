'use client';
import { Separator as Base } from '@base-ui/react/separator';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** Props hanji adds to Base UI's Separator. */
export interface SeparatorOwnProps {
  /** full = edge to edge · inset = starts where row text starts (72px by default). */
  variant?: 'full' | 'inset';
  /** A short word in the middle of the rule, e.g. “or”. Horizontal only. */
  label?: React.ReactNode;
}

export interface SeparatorProps extends SeparatorOwnProps, Base.Props {}

/**
 * A hairline between groups. hanji separates with rules, not boxes — depth is a paper step and a
 * hairline, never a shadow.
 *
 * @example
 * <Separator />
 * <Separator variant="inset" />
 * <Separator label="or" />
 */
export function Separator(props: SeparatorProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    variant = 'full',
    label,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Separator', props);
  const hasLabel = label !== undefined && label !== null && label !== false;
  return (
    <Base
      {...rest}
      data-variant={variant}
      data-label={hasLabel ? '' : undefined}
      className={cls(config, 'Separator', 'hj-separator', className)}
    >
      {hasLabel ? (
        <span className={config.unstyled ? undefined : 'hj-separator-label'}>{label}</span>
      ) : (
        children
      )}
    </Base>
  );
}
