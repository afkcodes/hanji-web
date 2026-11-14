import { icon } from '../create-icon.tsx';
import type { HanjiIcon } from '../create-icon.tsx';

/** `minus`. From Solar by 480 Design (CC BY 4.0), reshaped by hanji. */
export const IconMinus: HanjiIcon = /* @__PURE__ */ icon('minus', {
  line: [['s', 'M20 12h-16']],
  solid: [
    [
      'f',
      'M4 12.75c-.41 0-.75-.34-.75-.75c0-.41.34-.75.75-.75h16c.41 0 .75.34.75.75c0 .41-.34.75-.75.75h-16z',
    ],
  ],
  duo: [
    ['s', 'M20 12h-8'],
    ['~s', 'M12 12h-8'],
  ],
  duoSolid: [
    [
      'f',
      'M12 12.75c-.41 0-.75-.34-.75-.75c0-.41.34-.75.75-.75h8c.41 0 .75.34.75.75c0 .41-.34.75-.75.75h-8z',
    ],
    [
      '~f',
      'M4 12.75c-.41 0-.75-.34-.75-.75c0-.41.34-.75.75-.75h8c.41 0 .75.34.75.75c0 .41-.34.75-.75.75h-8z',
    ],
  ],
});
