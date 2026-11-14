import { CodeBlock } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <CodeBlock.Root style={{ width: '100%', maxWidth: 520 }}>
      <CodeBlock.Header>
        <CodeBlock.Language>shell</CodeBlock.Language>
        <CodeBlock.Actions>
          <CodeBlock.Copy showLabel={false} />
        </CodeBlock.Actions>
      </CodeBlock.Header>
      <CodeBlock.Code code="pnpm add @hanji/react @hanji/tokens" />
    </CodeBlock.Root>
  );
}
