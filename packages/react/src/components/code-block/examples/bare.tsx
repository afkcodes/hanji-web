import { CodeBlock } from '@hanji/react';

const CSS = `/* A quieter block inside a long reply */
.reply-code {
  --hj-code-block-max-height: 240px;
  --hj-code-block-bg: var(--hj-bg-soft);
  margin-block: 12px;
}

@media (prefers-color-scheme: dark) {
  .reply-code { --hj-code-block-keyword: #c792ea; }
}
`;

export function Example(): React.JSX.Element {
  return (
    <CodeBlock.Root language="css" style={{ width: '100%', maxWidth: 520 }}>
      <CodeBlock.Copy showLabel={false} />
      <CodeBlock.Code code={CSS} />
    </CodeBlock.Root>
  );
}
