import type * as React from 'react';

import type { HanjiIcon, IconVariant } from './create-icon.tsx';
import { IconAdd } from './icons/add.ts';
import { IconAltArrowDown } from './icons/alt-arrow-down.ts';
import { IconAltArrowLeft } from './icons/alt-arrow-left.ts';
import { IconAltArrowRight } from './icons/alt-arrow-right.ts';
import { IconAltArrowUp } from './icons/alt-arrow-up.ts';
import { IconArrowUp } from './icons/arrow-up.ts';
import { IconCheckCircle } from './icons/check-circle.ts';
import { IconCheck } from './icons/check.ts';
import { IconCloseCircle } from './icons/close-circle.ts';
import { IconClose } from './icons/close.ts';
import { IconCopy } from './icons/copy.ts';
import { IconDangerTriangle } from './icons/danger-triangle.ts';
import { IconEyeClosed } from './icons/eye-closed.ts';
import { IconEye } from './icons/eye.ts';
import { IconInfoCircle } from './icons/info-circle.ts';
import { IconMenuDots } from './icons/menu-dots.ts';
import { IconMinus } from './icons/minus.ts';
import { IconPaperclip } from './icons/paperclip.ts';
import { IconSearch } from './icons/search.ts';
import { IconStars } from './icons/stars.ts';
import { IconStop } from './icons/stop.ts';
import { IconWrench } from './icons/wrench.ts';

/** hanji's built-in glyph names, mapped to icons from this set. */
export const adapterIcons: Readonly<Record<string, HanjiIcon>> = {
  check: IconCheck,
  minus: IconMinus,
  plus: IconAdd,
  x: IconClose,
  chevronDown: IconAltArrowDown,
  chevronUp: IconAltArrowUp,
  chevronLeft: IconAltArrowLeft,
  chevronRight: IconAltArrowRight,
  search: IconSearch,
  eye: IconEye,
  eyeOff: IconEyeClosed,
  info: IconInfoCircle,
  alert: IconDangerTriangle,
  checkCircle: IconCheckCircle,
  xCircle: IconCloseCircle,
  arrowUp: IconArrowUp,
  stop: IconStop,
  copy: IconCopy,
  more: IconMenuDots,
  paperclip: IconPaperclip,
  sparkle: IconStars,
  tool: IconWrench,
};

/**
 * Every glyph hanji's components draw themselves, from this set, for `HanjiProvider icons`:
 * `<HanjiProvider icons={iconAdapter('solid')}>`. Adds ~22 icons to the bundle.
 */
export function iconAdapter(
  variant: IconVariant = 'outline',
): Readonly<Record<string, React.ReactNode>> {
  return Object.fromEntries(
    Object.entries(adapterIcons).map(([key, Icon]) => [key, <Icon key={key} variant={variant} />]),
  );
}
