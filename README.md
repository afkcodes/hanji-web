# hanji for the web

**Compound React components on [Base UI](https://base-ui.com), themed by hanji's tokens, styled with
zero-runtime CSS, and readable by coding agents.** The web sibling of
[hanji](https://github.com/afkcodes/hanji) (React Native): same papers, inks, springs and rules.

```tsx
import '@hanji/react/styles.css';
import { Button, Dialog, Theme } from '@hanji/react';

export function App() {
  return (
    <Theme paper="paper" accent="scarlet">
      <Dialog.Root>
        <Dialog.Trigger render={<Button variant="danger" />}>Delete playlist</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Close />
          <Dialog.Title>Delete “Late Night Drive”?</Dialog.Title>
          <Dialog.Description>48 tracks will be removed from this device.</Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close render={<Button variant="secondary" />}>Keep it</Dialog.Close>
            <Dialog.Close render={<Button variant="danger" />}>Delete playlist</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog.Root>
    </Theme>
  );
}
```

## Packages

| Package           | What it is                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@hanji/tokens`   | Colour maths, 3 papers × 12 accents, spacing/radius/type, springs compiled to CSS `linear()`, `createTheme()` (no deps) and `@hanji/tokens/schema` (zod + JSON Schema)         |
| `@hanji/react`    | The components, `styles.css` (one import) or `css/<component>.css`, plus `manifest.json`, `llms.txt`, `docs/*.md`                                                              |
| `@hanji/mcp`      | MCP server so agents can search components, read docs, fetch examples, read tokens and validate themes                                                                         |
| `@hanji/icons`    | 2,200+ icons in outline, solid and wash: one tree-shakable React component per icon, raw SVGs, a searchable catalog and a lazy `DynamicIcon`. Restyled from Tabler Icons (MIT) |
| `@hanji/tailwind` | Optional Tailwind v4 preset: `bg-surface`, `text-fg-dim`, `rounded-pill`, `ease-snappy`                                                                                        |

## Customise, from broad to precise

1. **Theme** — `<Theme paper accent density motion radius fonts colors springs>` or `createTheme({...})`. Nests; popups keep their subtree's theme.
2. **Variants** — props such as `variant`, `size`, `tone`, exposed as `data-*` attributes.
3. **Provider** — `<HanjiProvider defaults classNames unstyled icons strings>`: default props per slot, extra classes per slot, drop all hanji classes, swap the icon set, translate strings.
4. **Per part** — every part takes `className` (string or function of state), `style`, and Base UI's `render` to swap or compose the element.
5. **Component variables** — `--hj-button-height`, `--hj-dialog-width`, … set on the part or any ancestor.
6. **Cascade layers** — all library CSS lives in `@layer hj.*`, so your unlayered CSS wins without `!important`.

## AI-native

- **`llms.txt` / `llms-full.txt`** and per-component Markdown in `@hanji/react/docs/*`, generated from typed meta (a prop that isn't documented fails typecheck), embedding the exact Base UI API for the installed version.
- **`manifest.json`** — every component, part, prop, data-attribute, CSS variable, example (code), accessibility note and motion rule as JSON.
- **MCP server** — `npx @hanji/mcp` (or `node packages/mcp/dist/bin.js` here; `.mcp.json` registers it for Claude Code):
  `get_setup`, `list_components`, `search_components`, `get_component`, `get_example`, `get_tokens`, `get_theme_schema`, `validate_theme`, `search_icons`, `get_icon`.
- **Source registry** — shadcn-compatible items in `registry/` (`hanji-system` + one per component) to install components as editable source.
- **Typed theming** — `@hanji/tokens/theme.schema.json` with descriptions written for agents; `parseTheme()` returns field-level errors.
- **`AGENTS.md`** — the rules any agent follows when changing this repo.

## Performance

Zero runtime CSS. Springs are compiled to CSS `linear()` easings at build time and run on the
compositor; only finger-driven values use the tiny DOM-direct `useSpring`. Transforms and opacity
only. One stable context read per component. Per-module ESM output (tree-shakes per component,
`'use client'` preserved). `createTheme` ships without zod. Reduced motion is a token swap, not a
per-component branch.

## Tooling

pnpm workspaces + catalog · TypeScript 7 (native) with `isolatedDeclarations` · tsdown (Rolldown + oxc
declarations) · oxlint (react, react-perf, jsx-a11y, import, vitest) · oxfmt · Lightning CSS ·
Vitest 5 + happy-dom · Vite 8 playground · Turborepo · publint.

```
pnpm install
pnpm dev          # playground → http://localhost:4420
pnpm check        # fmt, lint (JS + CSS rules), typecheck, test, build
```
