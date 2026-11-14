import { icon } from '../create-icon.tsx';
import type { HanjiIcon } from '../create-icon.tsx';

/** `search`. Drawn for hanji. */
export const IconSearch: HanjiIcon = /* @__PURE__ */ icon('search', {
  line: [
    ['s', 'M11 2.75a8.25 8.25 0 1 1 0 16.5a8.25 8.25 0 0 1 0-16.5z'],
    ['s', 'M17.25 17.25l3.75 3.75'],
  ],
  solid: [
    ['f', 'M11 2.75a8.25 8.25 0 1 1 0 16.5a8.25 8.25 0 0 1 0-16.5z'],
    ['s', 'M17.25 17.25l3.75 3.75'],
  ],
  duo: [1],
  duoSolid: [0],
});
