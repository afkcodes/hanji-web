import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { beforeAll, describe, expect, it } from 'vitest';

import { loadData } from './data.ts';
import { createServer } from './server.ts';

let client: Client;
const textOf = (r: unknown): string =>
  (r as { content: { text: string }[] }).content[0]?.text ?? '';

beforeAll(async () => {
  const server = createServer(loadData());
  const [a, b] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'test', version: '0' });
  await Promise.all([server.connect(a), client.connect(b)]);
});

describe('hanji MCP', () => {
  it('lists tools, all read-only', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).toSorted()).toEqual(
      [
        'get_component',
        'get_example',
        'get_setup',
        'get_theme_schema',
        'get_tokens',
        'get_icon',
        'list_components',
        'search_icons',
        'search_components',
        'validate_theme',
      ].toSorted(),
    );
    expect(tools.every((t) => t.annotations?.readOnlyHint)).toBe(true);
  });

  it('finds icons by meaning and returns their SVG', async () => {
    const found = await client.callTool({ name: 'search_icons', arguments: { query: 'delete' } });
    expect(textOf(found)).toMatch(/IconTrash/);
    const one = await client.callTool({
      name: 'get_icon',
      arguments: { name: 'IconHome', variant: 'solid' },
    });
    const icon = JSON.parse(textOf(one)) as { import: string; svg: string };
    expect(icon.import).toBe("import { IconHome } from '@hanji/icons';");
    expect(icon.svg).toContain('fill="currentColor"');
  });

  it('reads a component doc by name, slug or part', async () => {
    const results = await Promise.all(
      ['Switch', 'switch', 'Switch.Root'].map((name) =>
        client.callTool({ name: 'get_component', arguments: { name } }),
      ),
    );
    for (const r of results) expect(textOf(r)).toContain('### Switch.Root');
  });

  it('finds the right component from a need', async () => {
    const r = await client.callTool({
      name: 'search_components',
      arguments: { query: 'confirm before deleting something' },
    });
    expect(textOf(r).split('\n')[0]).toMatch(/dialog/i);
  });

  it('returns runnable example code', async () => {
    const r = await client.callTool({
      name: 'get_example',
      arguments: { component: 'dialog', example: 'confirm' },
    });
    expect(textOf(r)).toContain("from '@hanji/react'");
  });

  it('validates themes with field-level issues', async () => {
    const bad = await client.callTool({
      name: 'validate_theme',
      arguments: { theme: { paper: 'ink', accent: 'teal-ish' } },
    });
    expect(bad.isError).toBe(true);
    expect(textOf(bad)).toContain('accent');
    const ok = await client.callTool({
      name: 'validate_theme',
      arguments: { theme: { paper: 'ink', accent: { light: '#0b6e4f', dark: '#5fd3a6' } } },
    });
    expect(JSON.parse(textOf(ok)).cssVariables['--hj-accent']).toBe('light-dark(#0b6e4f, #5fd3a6)');
  });

  it('serves llms.txt and component resources', async () => {
    const llms = await client.readResource({ uri: 'hanji://llms.txt' });
    const first = llms.contents[0];
    expect(first && 'text' in first ? first.text : '').toContain('# hanji');
    const { resources } = await client.listResources();
    expect(resources.some((r) => r.uri === 'hanji://components/button')).toBe(true);
  });
});
