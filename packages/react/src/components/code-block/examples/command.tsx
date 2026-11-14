import { CodeBlock } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: 'start', width: '100%', maxWidth: 520 }}>
      <CodeBlock.Snippet code="pnpm add @hanji/react @hanji/tokens" />
      <CodeBlock.Snippet language="tsx" code="import { CodeBlock, Theme } from '@hanji/react';" />
      <CodeBlock.Snippet code="claude mcp add hanji --scope project -- npx -y @hanji/mcp" />
    </div>
  );
}
