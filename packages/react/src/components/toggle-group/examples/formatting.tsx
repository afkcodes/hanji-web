import { Toggle, ToggleGroup } from '@hanji/react';

const Align = ({ d }: { d: string }): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
      <ToggleGroup multiple aria-label="Text style" defaultValue={['bold']}>
        <Toggle value="bold" iconOnly aria-label="Bold">
          <b style={{ fontSize: 15 }}>B</b>
        </Toggle>
        <Toggle value="italic" iconOnly aria-label="Italic">
          <i style={{ fontSize: 15, fontFamily: 'Georgia, serif' }}>I</i>
        </Toggle>
        <Toggle value="underline" iconOnly aria-label="Underline">
          <u style={{ fontSize: 15 }}>U</u>
        </Toggle>
      </ToggleGroup>
      <ToggleGroup aria-label="Alignment" defaultValue={['left']}>
        <Toggle value="left" iconOnly aria-label="Align left">
          <Align d="M4 6h16M4 12h10M4 18h13" />
        </Toggle>
        <Toggle value="center" iconOnly aria-label="Align centre">
          <Align d="M4 6h16M7 12h10M5.5 18h13" />
        </Toggle>
        <Toggle value="right" iconOnly aria-label="Align right">
          <Align d="M4 6h16M10 12h10M7 18h13" />
        </Toggle>
      </ToggleGroup>
      <ToggleGroup size="sm" aria-label="Show" multiple defaultValue={['lyrics']}>
        <Toggle value="lyrics">Lyrics</Toggle>
        <Toggle value="credits">Credits</Toggle>
        <Toggle value="queue">Queue</Toggle>
      </ToggleGroup>
    </div>
  );
}
