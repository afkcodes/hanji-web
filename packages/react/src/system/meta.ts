/**
 * The agent-readable description of a component. Every component folder has a `*.meta.ts`
 * built from these types; `scripts/build-ai.ts` turns them into `manifest.json`, `llms.txt`,
 * the MCP server's index and the source registry.
 *
 * Meta files import component prop types with `import type`, so `props<OwnProps>()` is
 * exhaustive: an undocumented prop, or a documented prop that doesn't exist, fails typecheck.
 */

export type Category =
  | 'foundation'
  | 'atoms'
  | 'controls'
  | 'surfaces'
  | 'navigation'
  | 'data'
  | 'ai';

export interface PropDoc {
  /** The type as a reader should see it, e.g. `'primary' | 'ink' | 'secondary'`. */
  type: string;
  default?: string;
  description: string;
}

export interface PartMeta {
  /** As used in JSX: `Root`, `Popup`, or the component's own name for single-part components. */
  name: string;
  /** The element rendered by default. */
  element: string;
  description: string;
  /** The Base UI part this wraps, e.g. `Dialog.Popup`. Its props are accepted too. */
  base?: string;
  /** Props hanji adds on top of Base UI's. */
  props?: Readonly<Record<string, PropDoc>>;
  /** Slot name for `HanjiProvider` classNames/defaults. */
  slot: string;
  /** hanji's class on this part. */
  className: string;
  /** Styling hooks: data-attributes set on this part. */
  dataAttributes?: Readonly<Record<string, string>>;
  /** Per-part CSS custom properties consumers may set (on the part or any ancestor). */
  cssVars?: Readonly<Record<string, string>>;
}

export interface ExampleMeta {
  /** File in the component's `examples/` folder, without extension. */
  file: string;
  title: string;
  description: string;
}

export interface ComponentMeta {
  name: string;
  /** kebab-case; folder name and registry id. */
  slug: string;
  category: Category;
  /** `new` = not in hanji (React Native); `stable` = ported. */
  status: 'stable' | 'new' | 'beta';
  /** One sentence: what it is for. */
  description: string;
  whenToUse: readonly string[];
  whenNotToUse: readonly string[];
  /** Import line(s), e.g. `import { Dialog } from '@hanji/react'`. */
  import: string;
  parts: readonly PartMeta[];
  examples: readonly ExampleMeta[];
  accessibility: readonly string[];
  /** The motion and why. */
  motion?: string;
  /** Tokens the component reads (without the `--hj-` prefix). */
  tokens: readonly string[];
  related: readonly string[];
  /** Base UI doc this builds on, e.g. `dialog` → node_modules/@base-ui/react/docs/react/components/dialog.md */
  baseUi?: string;
}

/** Identity function that type-checks a component's meta. */
export function defineMeta(meta: ComponentMeta): ComponentMeta {
  return meta;
}

/**
 * Exhaustive prop docs for a part's own props: `props<ButtonOwnProps>({ variant: {...}, … })`.
 * Missing or extra keys are type errors.
 */
export function props<P>(docs: { readonly [K in keyof Required<P>]: PropDoc }): Readonly<
  Record<string, PropDoc>
> {
  return docs as Readonly<Record<string, PropDoc>>;
}
