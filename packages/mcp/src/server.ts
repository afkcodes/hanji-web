import { checkThemeInput, parseTheme } from '@hanji/tokens/schema';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { findComponent, searchComponents } from './data.ts';
import type { HanjiData } from './data.ts';

const text = (t: string): { content: { type: 'text'; text: string }[] } => ({
  content: [{ type: 'text', text: t }],
});
const json = (v: unknown): { content: { type: 'text'; text: string }[] } =>
  text(JSON.stringify(v, null, 2));
const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;

/**
 * An MCP server over hanji's generated manifest. Every tool is read-only: it answers questions
 * about the library; it never edits a project.
 */
export function createServer(data: HanjiData): McpServer {
  const { manifest } = data;
  const server = new McpServer(
    { name: 'hanji', version: manifest.version },
    {
      instructions:
        'hanji is a React component library on Base UI. Before writing UI with it: get_setup once, search_components or list_components to pick parts, get_component for the exact API, get_example for idiomatic code. Use variants, tokens, slot classes and --hj-* variables instead of restyling internals. Validate any theme with validate_theme.',
    },
  );

  server.registerTool(
    'get_setup',
    {
      title: 'Setup and conventions',
      description:
        'How to install hanji, load its styles, theme an app, and the conventions every component follows (compound parts, render prop, data-attribute variants, customisation layers).',
      annotations: READ_ONLY,
    },
    () => json({ setup: manifest.setup, conventions: manifest.conventions }),
  );

  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description:
        'Every hanji component with its category, status and one-line purpose. Filter by category.',
      inputSchema: {
        category: z
          .enum(['foundation', 'atoms', 'controls', 'surfaces', 'navigation', 'data', 'ai'])
          .optional()
          .describe('Only this category.'),
      },
      annotations: READ_ONLY,
    },
    ({ category }) => {
      const list = manifest.components.filter((c) => !category || c.category === category);
      return {
        ...text(
          list
            .map(
              (c) =>
                `- ${c.name} (${c.slug}, ${c.category}${c.status === 'new' ? ', new' : ''}): ${c.description}`,
            )
            .join('\n'),
        ),
        structuredContent: {
          components: list.map(({ name, slug, category: cat, status, description }) => ({
            name,
            slug,
            category: cat,
            status,
            description,
          })),
        },
      };
    },
  );

  server.registerTool(
    'search_components',
    {
      title: 'Search components',
      description:
        'Find the right component for a need in plain words, e.g. "confirm before deleting", "pick a date range", "stream an AI answer".',
      inputSchema: {
        query: z.string().min(2).describe('What the UI needs to do.'),
        limit: z.number().int().min(1).max(20).optional(),
      },
      annotations: READ_ONLY,
    },
    ({ query, limit }) => {
      const hits = searchComponents(manifest, query, limit ?? 6);
      if (!hits.length)
        return text(`No component matches "${query}". Call list_components to browse.`);
      return text(
        hits
          .map(
            ({ component: c }) =>
              `- ${c.name} (${c.slug}): ${c.description}\n  use when: ${c.whenToUse[0] ?? ''}`,
          )
          .join('\n'),
      );
    },
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get a component',
      description:
        "A component's full doc: when to use, every part with its props, data-attributes and CSS variables, examples, accessibility, motion, and the Base UI API it inherits.",
      inputSchema: {
        name: z.string().describe('Name or slug, e.g. "Dialog", "date-picker", "Dialog.Popup".'),
      },
      annotations: READ_ONLY,
    },
    ({ name }) => {
      const c = findComponent(manifest, name);
      if (!c) {
        const near = searchComponents(manifest, name, 3).map((h) => h.component.slug);
        return {
          ...text(
            `No component "${name}".${near.length ? ` Did you mean: ${near.join(', ')}?` : ''}`,
          ),
          isError: true,
        };
      }
      return text(data.doc(c.slug) ?? JSON.stringify(c, null, 2));
    },
  );

  server.registerTool(
    'get_example',
    {
      title: 'Get example code',
      description:
        'Working TSX for a component, as a user would write it. Omit `example` to list them.',
      inputSchema: {
        component: z.string(),
        example: z.string().optional().describe('Example file name, e.g. "confirm".'),
      },
      annotations: READ_ONLY,
    },
    ({ component, example }) => {
      const c = findComponent(manifest, component);
      if (!c) return { ...text(`No component "${component}".`), isError: true };
      if (!example)
        return text(
          c.examples.map((e) => `- ${e.file}: ${e.title} — ${e.description}`).join('\n') ||
            'No examples.',
        );
      const ex = c.examples.find(
        (e) => e.file === example || e.title.toLowerCase() === example.toLowerCase(),
      );
      return ex
        ? text(`// ${c.name} — ${ex.title}\n${ex.code}`)
        : { ...text(`No example "${example}" for ${c.name}.`), isError: true };
    },
  );

  server.registerTool(
    'get_tokens',
    {
      title: 'Get design tokens',
      description:
        'Resolved token values: papers (surface steps and inks), accents (light/dark stops), status colours, data series, spacing, radius, type roles, motion (springs with settle times).',
      inputSchema: {
        group: z
          .enum([
            'papers',
            'accents',
            'status',
            'dataSeries',
            'spacing',
            'radius',
            'densities',
            'type',
            'motion',
          ])
          .optional(),
      },
      annotations: READ_ONLY,
    },
    ({ group }) => json(group ? data.tokens[group] : data.tokens),
  );

  server.registerTool(
    'get_theme_schema',
    {
      title: 'Theme JSON Schema',
      description:
        'The JSON Schema for createTheme() / <Theme>: paper, accent, density, motion, radius, fonts, colors, springs.',
      annotations: READ_ONLY,
    },
    () => json(data.schema),
  );

  server.registerTool(
    'validate_theme',
    {
      title: 'Validate a theme',
      description:
        'Check a theme object before using it. Returns field-level issues, or the resolved attributes, CSS variables and the JSX to apply it.',
      inputSchema: {
        theme: z
          .record(z.string(), z.unknown())
          .describe(
            'A createTheme() input, e.g. {"paper":"ink","accent":"cobalt","density":"compact"}.',
          ),
      },
      annotations: READ_ONLY,
    },
    ({ theme }) => {
      const check = checkThemeInput(theme);
      if (!check.success) return { ...json({ valid: false, issues: check.issues }), isError: true };
      const t = parseTheme(theme);
      const props = Object.entries(theme)
        .map(([k, v]) => (typeof v === 'string' ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`))
        .join(' ');
      return json({
        valid: true,
        attributes: t.attributes,
        cssVariables: t.vars,
        jsx: `<Theme ${props}>…</Theme>`,
        css: t.toCss(),
      });
    },
  );

  server.registerResource(
    'llms',
    'hanji://llms.txt',
    { title: 'hanji llms.txt', mimeType: 'text/markdown' },
    (uri) => ({ contents: [{ uri: uri.href, text: data.llms }] }),
  );
  server.registerResource(
    'manifest',
    'hanji://manifest.json',
    { title: 'hanji manifest', mimeType: 'application/json' },
    (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(manifest) }] }),
  );
  server.registerResource(
    'component',
    new ResourceTemplate('hanji://components/{slug}', {
      list: () => ({
        resources: manifest.components.map((c) => ({
          uri: `hanji://components/${c.slug}`,
          name: c.name,
          description: c.description,
          mimeType: 'text/markdown',
        })),
      }),
    }),
    { title: 'Component doc', mimeType: 'text/markdown' },
    (uri, { slug }) => ({
      contents: [{ uri: uri.href, text: data.doc(String(slug)) ?? `No component ${String(slug)}` }],
    }),
  );

  return server;
}
