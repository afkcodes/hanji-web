import * as React from 'react';

/**
 * The glyphs components draw on their own. hanji ships a minimal 1.5-stroke set so it works out
 * of the box; pass your icon set through `HanjiProvider icons={…}` to replace any of them.
 */
export const iconNames = [
  'check',
  'minus',
  'plus',
  'x',
  'chevronDown',
  'chevronUp',
  'chevronLeft',
  'chevronRight',
  'search',
  'eye',
  'eyeOff',
  'info',
  'alert',
  'checkCircle',
  'xCircle',
  'arrowUp',
  'stop',
  'copy',
  'more',
  'paperclip',
  'sparkle',
  'tool',
] as const;
export type IconName = (typeof iconNames)[number];
export type IconMap = Readonly<Record<IconName, React.ReactNode>>;

const paths: Readonly<Record<IconName, string>> = {
  check: 'M20 6 9 17l-5-5',
  minus: 'M5 12h14',
  plus: 'M12 5v14M5 12h14',
  x: 'M18 6 6 18M6 6l12 12',
  chevronDown: 'm6 9 6 6 6-6',
  chevronUp: 'm18 15-6-6-6 6',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.6-3.6',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  eyeOff:
    'M10.7 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.5 5-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 16v-4.5M12 8h.01',
  alert:
    'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01',
  checkCircle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8.5 12l2.5 2.5 4.5-5',
  xCircle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM15 9l-6 6M9 9l6 6',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  stop: 'M8 7h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z',
  copy: 'M9 9h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V9ZM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  paperclip:
    'm21 11-8.6 8.6a5 5 0 0 1-7-7l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.3-2.3L16 7',
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z',
  tool: 'M14.7 6.3a4 4 0 0 0 5 5L22 13.6 13.6 22l-2.3-2.3a4 4 0 0 0-5-5L4 12.4 12.4 4Z',
};

function Glyph({ d }: { d: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

export const defaultIcons: IconMap = Object.fromEntries(
  iconNames.map((n) => [n, <Glyph key={n} d={paths[n]} />]),
) as IconMap;
