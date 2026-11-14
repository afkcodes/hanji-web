import { CodeBlock } from '@hanji/react';

const CODE = `import { createTheme, Theme } from '@hanji/react';

const night = createTheme({ paper: 'ink', accent: 'cobalt', density: 'compact' });

export function NowPlaying({ children }: { children: React.ReactNode }) {
  // Everything inside — including popups portalled to <body> — draws in ink.
  return <Theme theme={night}>{children}</Theme>;
}
`;

export function Example(): React.JSX.Element {
  return (
    <CodeBlock.Root lineNumbers style={{ width: '100%', maxWidth: 620 }}>
      <CodeBlock.Header>
        <CodeBlock.Language>tsx</CodeBlock.Language>
        <CodeBlock.Filename>src/player/now-playing.tsx</CodeBlock.Filename>
        <CodeBlock.Actions>
          <CodeBlock.WrapToggle />
          <CodeBlock.Copy />
        </CodeBlock.Actions>
      </CodeBlock.Header>
      <CodeBlock.Code code={CODE} />
    </CodeBlock.Root>
  );
}
