import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toolbar } from '@hanji/react';

const Bold = (): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />
  </svg>
);
const Italic = (): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M10 5h8M6 19h8M14.5 5 9.5 19" />
  </svg>
);
const Align = ({ d }: { d: string }): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
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
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Group aria-label="Style">
        <Toolbar.Toggle iconOnly aria-label="Bold" defaultPressed>
          <Bold />
        </Toolbar.Toggle>
        <Toolbar.Toggle iconOnly aria-label="Italic">
          <Italic />
        </Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Separator />
      <ToggleGroup
        defaultValue={['left']}
        aria-label="Alignment"
        style={{ display: 'flex', gap: 2 }}
      >
        <Toolbar.Toggle iconOnly value="left" aria-label="Align left">
          <Align d="M4 6h16M4 12h10M4 18h13" />
        </Toolbar.Toggle>
        <Toolbar.Toggle iconOnly value="center" aria-label="Align centre">
          <Align d="M4 6h16M7 12h10M5.5 18h13" />
        </Toolbar.Toggle>
        <Toolbar.Toggle iconOnly value="right" aria-label="Align right">
          <Align d="M4 6h16M10 12h10M7 18h13" />
        </Toolbar.Toggle>
      </ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.Button>Insert link</Toolbar.Button>
      <Toolbar.Button disabled>Undo</Toolbar.Button>
    </Toolbar.Root>
  );
}
