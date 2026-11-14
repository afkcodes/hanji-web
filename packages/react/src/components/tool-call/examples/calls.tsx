import { ToolCall } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 560, display: 'grid', gap: 10 }}>
      <ToolCall.Root status="done">
        <ToolCall.Trigger>
          <ToolCall.Name>library.search</ToolCall.Name>
          <ToolCall.Status duration="0.4 s" />
        </ToolCall.Trigger>
        <ToolCall.Panel>
          <ToolCall.Section label="Arguments">
            <ToolCall.Code value={{ query: 'tempo:165-175 liked:true', limit: 40 }} />
          </ToolCall.Section>
          <ToolCall.Section label="Result">
            <ToolCall.Code
              value={{ matches: 37, totalMinutes: 41, skipped: ['Paper Cranes (live)'] }}
            />
          </ToolCall.Section>
        </ToolCall.Panel>
      </ToolCall.Root>

      <ToolCall.Root status="running">
        <ToolCall.Trigger>
          <ToolCall.Name>playlist.create</ToolCall.Name>
          <ToolCall.Status duration="2.1 s" />
        </ToolCall.Trigger>
        <ToolCall.Panel>
          <ToolCall.Section label="Arguments">
            <ToolCall.Code value={{ name: 'Tempo run · 41 min', tracks: 37 }} />
          </ToolCall.Section>
        </ToolCall.Panel>
      </ToolCall.Root>

      <ToolCall.Root status="failed" defaultOpen>
        <ToolCall.Trigger>
          <ToolCall.Name>lyrics.fetch</ToolCall.Name>
          <ToolCall.Status duration="5.0 s" />
        </ToolCall.Trigger>
        <ToolCall.Panel>
          <ToolCall.Section label="Arguments">
            <ToolCall.Code value={{ track: 'Night Bus Home', artist: 'Noor Haddad' }} />
          </ToolCall.Section>
          <ToolCall.Section label="Error">
            <ToolCall.Code>
              Timed out after 5 s (lyrics service unreachable). The reply continues without lyrics.
            </ToolCall.Code>
          </ToolCall.Section>
        </ToolCall.Panel>
      </ToolCall.Root>
    </div>
  );
}
