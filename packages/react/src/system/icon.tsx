'use client';
import * as React from 'react';

import { useHanjiConfig } from './config.tsx';
import type { IconName } from './icons.tsx';

export interface IconProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** A glyph from the icon adapter (`HanjiProvider icons`). */
  name: IconName;
  /** Size in px; the glyph scales with font-size. @default 20 */
  size?: number;
  /** Accessible label. Omit for decorative icons (the default). */
  label?: string;
}

/** Renders a glyph through the icon adapter. Decorative unless `label` is given. */
export function Icon({
  name,
  size = 20,
  label,
  className,
  style,
  ...rest
}: IconProps): React.JSX.Element {
  const config = useHanjiConfig();
  const sized = React.useMemo(
    () => (size === 20 && !style ? undefined : { fontSize: size, ...style }),
    [size, style],
  );
  return (
    <span
      className={config.unstyled ? className : className ? `hj-icon ${className}` : 'hj-icon'}
      style={sized}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {config.icons[name]}
    </span>
  );
}
