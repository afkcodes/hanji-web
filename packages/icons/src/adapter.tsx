import type * as React from 'react';

import type { HanjiIcon, IconVariant } from './create-icon.tsx';
import { IconAlertTriangle } from './icons/alert-triangle.ts';
import { IconArrowUp } from './icons/arrow-up.ts';
import { IconCheck } from './icons/check.ts';
import { IconChevronDown } from './icons/chevron-down.ts';
import { IconChevronLeft } from './icons/chevron-left.ts';
import { IconChevronRight } from './icons/chevron-right.ts';
import { IconChevronUp } from './icons/chevron-up.ts';
import { IconCircleCheck } from './icons/circle-check.ts';
import { IconCircleX } from './icons/circle-x.ts';
import { IconCopy } from './icons/copy.ts';
import { IconDots } from './icons/dots.ts';
import { IconEyeOff } from './icons/eye-off.ts';
import { IconEye } from './icons/eye.ts';
import { IconInfoCircle } from './icons/info-circle.ts';
import { IconMinus } from './icons/minus.ts';
import { IconPaperclip } from './icons/paperclip.ts';
import { IconPlayerStop } from './icons/player-stop.ts';
import { IconPlus } from './icons/plus.ts';
import { IconSearch } from './icons/search.ts';
import { IconSparkles } from './icons/sparkles.ts';
import { IconTool } from './icons/tool.ts';
import { IconX } from './icons/x.ts';

/** hanji's built-in glyph names, mapped to icons from this set. */
export const adapterIcons: Readonly<Record<string, HanjiIcon>> = {
  check: IconCheck,
  minus: IconMinus,
  plus: IconPlus,
  x: IconX,
  chevronDown: IconChevronDown,
  chevronUp: IconChevronUp,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  search: IconSearch,
  eye: IconEye,
  eyeOff: IconEyeOff,
  info: IconInfoCircle,
  alert: IconAlertTriangle,
  checkCircle: IconCircleCheck,
  xCircle: IconCircleX,
  arrowUp: IconArrowUp,
  stop: IconPlayerStop,
  copy: IconCopy,
  more: IconDots,
  paperclip: IconPaperclip,
  sparkle: IconSparkles,
  tool: IconTool,
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
