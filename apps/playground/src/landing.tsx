import {
  Avatar,
  Button,
  CodeBlock,
  Field,
  Icon,
  Kbd,
  Link,
  Message,
  SegmentedControl,
  Slider,
  Status,
  Switch,
  Toggle,
  ToggleGroup,
  ToolCall,
  tokenizeCode,
} from '@hanji/react';
import { accentNames, accents, paperNames } from '@hanji/tokens';
import * as React from 'react';

import { categories, entries } from './registry.ts';

const GITHUB = 'https://github.com/afkcodes/hanji-web';
const cap = (v: string): string => v.charAt(0).toUpperCase() + v.slice(1);
const aiCount = categories.find((c) => c.id === 'ai')?.items.length ?? 0;

export interface LandingProps {
  paper: string;
  accent: string;
  density: string;
  onPaper: (paper: string) => void;
  onAccent: (accent: string) => void;
}

/** Inline code, highlighted by CodeBlock's own tokenizer. */
function Code({ children, lang = 'tsx' }: { children: string; lang?: string }): React.JSX.Element {
  return (
    <code className="lp-code">
      {tokenizeCode(children, lang).map((t, i) =>
        t.kind ? (
          // oxlint-disable-next-line react/no-array-index-key -- tokens are positional
          <span key={i} className="hj-code-block-token" data-token={t.kind}>
            {t.text}
          </span>
        ) : (
          t.text
        ),
      )}
    </code>
  );
}

/* ---------------------------------------------------------------- proof sheet */

/**
 * Hanji's long mulberry fibres, drawn once: seeded curves in three weights, so the sheet looks the
 * same on every load. Three paths in all, so the DOM stays small.
 */
const r1 = (n: number): string => n.toFixed(1);
const FIBRES: readonly string[] = (() => {
  let seed = 20_261_114;
  const rnd = (): number => {
    seed = (seed * 16_807) % 2_147_483_647;
    return seed / 2_147_483_647;
  };
  const groups = ['', '', ''];
  for (let i = 0; i < 150; i++) {
    const x = rnd() * 640;
    const y = rnd() * 600;
    const len = 24 + rnd() ** 2 * 150;
    const a = rnd() * Math.PI;
    const dx = Math.cos(a) * len;
    const dy = Math.sin(a) * len;
    const bend = (rnd() - 0.5) * len * 0.6;
    const cx = x + dx / 2 - (dy / len) * bend;
    const cy = y + dy / 2 + (dx / len) * bend;
    groups[i % 3] += `M${r1(x)} ${r1(y)}Q${r1(cx)} ${r1(cy)} ${r1(x + dx)} ${r1(y + dy)}`;
  }
  return groups;
})();

function Cell({
  n,
  name,
  wide,
  children,
}: {
  n: string;
  name: string;
  wide?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="lp-cell" data-wide={wide ? '' : undefined}>
      <span className="lp-cell-label" aria-hidden="true">
        {n} <b>{name}</b>
      </span>
      <div className="lp-cell-body">{children}</div>
    </div>
  );
}

const STRIP = [
  ['fg', 'var(--hj-fg)'],
  ['75', 'color-mix(in srgb, var(--hj-fg) 75%, var(--hj-surface))'],
  ['50', 'color-mix(in srgb, var(--hj-fg) 50%, var(--hj-surface))'],
  ['25', 'color-mix(in srgb, var(--hj-fg) 25%, var(--hj-surface))'],
  ['accent', 'var(--hj-accent)'],
  ['soft', 'var(--hj-accent-soft)'],
  ['seal', 'var(--hj-seal)'],
  ['1', 'var(--hj-data-1)'],
  ['2', 'var(--hj-data-2)'],
  ['3', 'var(--hj-data-3)'],
  ['4', 'var(--hj-data-4)'],
  ['5', 'var(--hj-data-5)'],
  ['6', 'var(--hj-data-6)'],
] as const;

function ProofSheet({
  paper,
  accent,
  density,
  onPaper,
  onAccent,
}: LandingProps): React.JSX.Element {
  const [volume, setVolume] = React.useState(62);
  return (
    <figure className="lp-proof">
      <div className="lp-table">
        <div className="lp-sheet">
          <svg
            className="lp-fibres"
            viewBox="0 0 640 600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {FIBRES.map((d, i) => (
              // oxlint-disable-next-line react/no-array-index-key -- three fixed weights
              <path key={i} d={d} data-w={i} />
            ))}
          </svg>
          <header className="lp-slug">
            <span>Proof 01</span>
            <span>
              {paper} · {accent} · {density}
            </span>
            <span>hanji/react 0.1</span>
          </header>
          <div className="lp-cells">
            <Cell n="01" name="Button">
              <div className="lp-inline">
                <Button variant="secondary">Save draft</Button>
                <Button>Publish</Button>
              </div>
            </Cell>
            <Cell n="02" name="Switch">
              <Field.Root className="lp-setting">
                <div>
                  <Field.Label>Gapless playback</Field.Label>
                  <Field.Description>No silence between tracks</Field.Description>
                </div>
                <Switch.Root defaultChecked />
              </Field.Root>
            </Cell>
            <Cell n="03" name="SegmentedControl">
              <SegmentedControl.Root defaultValue="week" aria-label="Listening range">
                <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
                <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
                <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
              </SegmentedControl.Root>
            </Cell>
            <Cell n="04" name="Slider">
              <div className="lp-volume">
                <Slider.Root
                  value={volume}
                  onValueChange={(v) => setVolume(v as number)}
                  style={{ flex: 1 }}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Indicator />
                      <Slider.Thumb aria-label="Volume" />
                    </Slider.Track>
                  </Slider.Control>
                </Slider.Root>
                <span className="lp-mono">{volume}%</span>
              </div>
            </Cell>
            <Cell n="05" name="Field · Kbd" wide>
              <Field.Root>
                <Field.Label className="hj-sr-only">Search</Field.Label>
                <Field.Shell>
                  <Field.Adornment>
                    <Icon name="search" />
                  </Field.Adornment>
                  <Field.Control type="search" placeholder="Artists, songs or podcasts" />
                  <Field.Adornment>
                    <Kbd size="sm">⌘</Kbd>
                    <Kbd size="sm">K</Kbd>
                  </Field.Adornment>
                </Field.Shell>
              </Field.Root>
            </Cell>
            <Cell n="06" name="Avatar.Group">
              <div className="lp-inline">
                <Avatar.Group max={3} label="Mira, Jun-seo, Ilse and 2 others">
                  <Avatar.Root name="Mira Okafor" />
                  <Avatar.Root name="Jun-seo Park" />
                  <Avatar.Root name="Ilse Brandt" />
                  <Avatar.Root name="Tomás Reyes" />
                  <Avatar.Root name="Aiko Sato" />
                </Avatar.Group>
                <span className="lp-small">5 editing Late Night Drive</span>
              </div>
            </Cell>
            <Cell n="07" name="Status">
              <div className="lp-stack">
                <Status tone="success" meta="Yesterday">
                  Downloaded
                </Status>
                <Status tone="danger" meta="Disk full">
                  Failed
                </Status>
              </div>
            </Cell>
          </div>
          <footer className="lp-strip" aria-hidden="true">
            <span className="lp-strip-bars">
              {STRIP.map(([label, color]) => (
                <i key={label} style={{ background: color }} title={label} />
              ))}
            </span>
            <span className="lp-mono">100 75 50 25 · accent · seal · 1–6</span>
          </footer>
        </div>
        <span className="lp-stamp" aria-hidden="true">
          한지
        </span>
        <span className="lp-crop" data-c="tl" aria-hidden="true" />
        <span className="lp-crop" data-c="tr" aria-hidden="true" />
        <span className="lp-crop" data-c="bl" aria-hidden="true" />
        <span className="lp-crop" data-c="br" aria-hidden="true" />
        <svg className="lp-reg" data-at="top" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="6" />
          <path d="M12 0v24M0 12h24" />
        </svg>
        <svg className="lp-reg" data-at="left" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="6" />
          <path d="M12 0v24M0 12h24" />
        </svg>
      </div>
      <figcaption className="lp-press">
        <span className="lp-press-label">Re-ink this page</span>
        <SegmentedControl.Root
          size="sm"
          aria-label="Paper"
          value={paper}
          onValueChange={(v) => onPaper(String(v))}
        >
          {paperNames.map((p) => (
            <SegmentedControl.Item key={p} value={p}>
              {cap(p)}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
        <ToggleGroup
          size="sm"
          aria-label="Accent"
          className="lp-inks"
          value={[accent]}
          onValueChange={(v: unknown[]) => {
            const next = v[0];
            if (typeof next === 'string') onAccent(next);
          }}
        >
          {accentNames.map((n) => (
            <Toggle key={n} value={n} iconOnly aria-label={cap(n)} title={cap(n)}>
              <i
                className="lp-ink"
                style={{ background: `light-dark(${accents[n].light}, ${accents[n].dark})` }}
              />
            </Toggle>
          ))}
        </ToggleGroup>
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- anatomy */

function Pin({ n, at }: { n: number; at?: string }): React.JSX.Element {
  return (
    <span className="lp-pin" data-at={at} aria-hidden="true">
      {n}
    </span>
  );
}

const PARTS = [
  ['Field.Label', '<label>', 'className · render'],
  ['Field.Shell', '<div>', '--hj-field-radius · --hj-field-bg'],
  ['Field.Adornment', '<span>', 'any icon, Kbd or Button'],
  ['Field.Control', '<input>', '--hj-field-height · Base UI validity'],
  ['Field.Description', '<p>', 'wired to aria-describedby'],
] as const;

const LAYERS = [
  [
    'Theme',
    'Paper, accent, density, motion and corners for a subtree.',
    "createTheme({ paper: 'ink', accent: 'cobalt' })",
  ],
  [
    'Variants',
    'Sizes and tones as data attributes you can select.',
    '<Button variant="ink" size="lg">',
  ],
  [
    'Provider',
    'App-wide defaults, classes, icons and strings.',
    "<HanjiProvider defaults={{ Button: { size: 'sm' } }}>",
  ],
  [
    'Parts',
    'className, style and render on every part.',
    '<Dialog.Popup render={<motion.div />} />',
  ],
  [
    'Variables',
    'Each component reads its own --hj-* hooks.',
    '.search { --hj-field-height: 52px; }',
  ],
  [
    'Layers',
    'hanji sits in @layer, so plain CSS wins without !important.',
    '@layer hj.tokens, hj.base, hj.components;',
  ],
] as const;

function Anatomy(): React.JSX.Element {
  return (
    <section className="lp-section" aria-labelledby="lp-anatomy">
      <div className="lp-head">
        <p className="lp-eyebrow">02 · Anatomy</p>
        <h2 id="lp-anatomy" className="lp-h2">
          Every part is yours.
        </h2>
        <p className="lp-body">
          Components are compound: each part is its own element with its own class, slot and render
          prop. Restyle one, replace another — Base UI keeps the behaviour, focus and ARIA.
        </p>
      </div>
      <div className="lp-anatomy">
        <div className="lp-plate">
          <Field.Root className="lp-specimen">
            <Field.Label>
              Search your library
              <Pin n={1} />
            </Field.Label>
            <Field.Shell>
              <Pin n={2} at="shell" />
              <Field.Adornment>
                <Icon name="search" />
              </Field.Adornment>
              <Field.Control placeholder="Artists, songs or podcasts" />
              <Pin n={3} at="adornment" />
              <Pin n={4} at="control" />
            </Field.Shell>
            <Field.Description>
              Searches 1,284 songs on this device
              <Pin n={5} />
            </Field.Description>
          </Field.Root>
        </div>
        <table className="lp-spec">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Part</th>
              <th scope="col">Renders</th>
              <th scope="col">Change it with</th>
            </tr>
          </thead>
          <tbody>
            {PARTS.map(([part, el, how], i) => (
              <tr key={part}>
                <td>
                  <span className="lp-pin" data-static="">
                    {i + 1}
                  </span>
                </td>
                <th scope="row">{part}</th>
                <td className="lp-mono">{el}</td>
                <td>{how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ol className="lp-layers" aria-label="Ways to customise, from broad to exact">
        {LAYERS.map(([name, what, code], i) => (
          <li key={name}>
            <span className="lp-layer-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="lp-layer-name">{name}</span>
            <span className="lp-layer-what">{what}</span>
            <Code lang={code.startsWith('.') || code.startsWith('@') ? 'css' : 'tsx'}>{code}</Code>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------- agents */

const ARTEFACTS = [
  ['manifest.json', 'Every part, prop, data attribute, CSS variable and token, typed.'],
  ['llms.txt', 'An index of the docs; llms-full.txt is the whole set in one read.'],
  ['registry/', 'Each component’s source, in the shadcn registry format.'],
  ['@hanji/mcp', 'Eight read-only tools: search, get_component, get_example, get_tokens…'],
] as const;

const ROW = `<Field.Root className="setting">
  <Field.Label>Gapless playback</Field.Label>
  <Field.Description>No silence between tracks</Field.Description>
  <Switch.Root defaultChecked />
</Field.Root>`;

function Agents(): React.JSX.Element {
  return (
    <section id="agents" className="lp-section" aria-labelledby="lp-agents">
      <div className="lp-agents">
        <div>
          <p className="lp-eyebrow">03 · For agents</p>
          <h2 id="lp-agents" className="lp-h2">
            Your agent reads it too.
          </h2>
          <p className="lp-body">
            Every component is described in a typed manifest that the docs, the registry and an MCP
            server are generated from. Coding agents look parts up instead of guessing them.
          </p>
          <dl className="lp-artefacts">
            {ARTEFACTS.map(([name, what]) => (
              <div key={name}>
                <dt className="lp-mono">{name}</dt>
                <dd>{what}</dd>
              </div>
            ))}
          </dl>
          <CodeBlock.Snippet
            className="lp-install"
            code="claude mcp add hanji -- npx -y @hanji/mcp"
          />
        </div>
        <div className="lp-chat">
          <Message.Root from="user">
            <Message.Content>Add a gapless playback setting under Playback.</Message.Content>
          </Message.Root>
          <ToolCall.Root status="done">
            <ToolCall.Trigger>
              <ToolCall.Name>hanji.get_component</ToolCall.Name>
              <ToolCall.Status />
            </ToolCall.Trigger>
            <ToolCall.Panel>
              <ToolCall.Section label="Arguments">
                <ToolCall.Code value={{ name: 'switch' }} />
              </ToolCall.Section>
              <ToolCall.Section label="Result">
                <ToolCall.Code>
                  Switch.Root (Thumb inside) · size sm | md · data-checked · --hj-switch-thumb
                </ToolCall.Code>
              </ToolCall.Section>
            </ToolCall.Panel>
          </ToolCall.Root>
          <Message.Root from="assistant">
            <Message.Avatar>한</Message.Avatar>
            <Message.Author>Assistant</Message.Author>
            <Message.Content>
              <p>
                A Field gives the switch its label and description; Switch applies the change the
                moment it’s flipped, so the row needs no Save button.
              </p>
              <CodeBlock.Root language="tsx">
                <CodeBlock.Header>
                  <CodeBlock.Language />
                  <CodeBlock.Filename>settings/playback.tsx</CodeBlock.Filename>
                  <CodeBlock.Actions>
                    <CodeBlock.Copy />
                  </CodeBlock.Actions>
                </CodeBlock.Header>
                <CodeBlock.Code code={ROW} />
              </CodeBlock.Root>
              <Field.Root className="lp-setting lp-result">
                <div>
                  <Field.Label>Gapless playback</Field.Label>
                  <Field.Description>No silence between tracks</Field.Description>
                </div>
                <Switch.Root defaultChecked />
              </Field.Root>
            </Message.Content>
          </Message.Root>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- contents */

/** Running number of each component across the chapters, as in a book's contents. */
const ORDER = new Map(categories.flatMap((c) => c.items).map((e, i) => [e.meta.slug, i + 1]));

function Contents(): React.JSX.Element {
  return (
    <section id="contents" className="lp-section" aria-labelledby="lp-contents">
      <div className="lp-head">
        <p className="lp-eyebrow">04 · Contents</p>
        <h2 id="lp-contents" className="lp-h2">
          {entries.length} components, {categories.length} chapters.
        </h2>
      </div>
      <nav className="lp-toc" aria-label="All components">
        {categories.map((c) => (
          <div key={c.id} className="lp-chapter">
            <h3>
              <span>{c.id}</span>
              <span className="lp-mono">{c.items.length}</span>
            </h3>
            <ol>
              {c.items.map((e) => (
                <li key={e.meta.slug}>
                  <a href={`#/${e.meta.slug}`}>
                    <span>{e.meta.name}</span>
                    {e.meta.status === 'new' ? <i className="lp-new">new</i> : null}
                    <span className="lp-leader" aria-hidden="true" />
                    <span className="lp-mono">
                      {String(ORDER.get(e.meta.slug) ?? 0).padStart(2, '0')}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </nav>
    </section>
  );
}

/* ---------------------------------------------------------------- page */

export function Landing(props: LandingProps): React.JSX.Element {
  return (
    <div className="lp">
      <header className="lp-nav">
        <a className="lp-brand" href="#/">
          <span className="pg-seal">한지</span> hanji
        </a>
        <nav aria-label="Site" className="lp-links">
          <Link href="#/components" tone="fg" underline="hover">
            Components
          </Link>
          <Link href="#agents" tone="fg" underline="hover">
            For agents
          </Link>
          <Link href={GITHUB} tone="fg" underline="hover" external>
            GitHub
          </Link>
        </nav>
      </header>

      <main>
        <section className="lp-hero" aria-labelledby="lp-title">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow">hanji for the web · 0.1 · on Base UI 1.9</p>
            <h1 id="lp-title" className="lp-title">
              Components on good paper.
            </h1>
            <p className="lp-lede">
              {entries.length} compound React components on Base UI, drawn in plain CSS from tokens
              you can re-ink — and written down so your agent can read them too.
            </p>
            <CodeBlock.Snippet className="lp-install" code="pnpm add @hanji/react @hanji/tokens" />
            <div className="lp-actions">
              <Button size="lg" render={<a href="#/components" />} nativeButton={false}>
                Browse components
                <Icon name="chevronRight" size={18} />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                render={<a href="#contents" />}
                nativeButton={false}
              >
                See all {entries.length}
              </Button>
            </div>
          </div>
          <ProofSheet {...props} />
        </section>

        <dl className="lp-facts">
          <div>
            <dt>components, every part exported</dt>
            <dd>{entries.length}</dd>
          </div>
          <div>
            <dt>built for AI interfaces</dt>
            <dd>{aiCount}</dd>
          </div>
          <div>
            <dt>papers × accents</dt>
            <dd>
              {paperNames.length}
              <small>×</small>
              {accentNames.length}
            </dd>
          </div>
          <div>
            <dt>read-only MCP tools</dt>
            <dd>8</dd>
          </div>
          <div>
            <dt>kB of CSS-in-JS runtime</dt>
            <dd>0</dd>
          </div>
        </dl>

        <Anatomy />
        <Agents />
        <Contents />
      </main>

      <footer className="lp-foot">
        <p className="lp-wordmark" aria-hidden="true">
          hanji
        </p>
        <div className="lp-foot-side">
          <span className="pg-seal">한지</span>
          <p>
            Hanji is Korean paper made from the inner bark of the paper mulberry: thin, strong and
            made to last. The components try to be the same.
          </p>
          <nav aria-label="Footer" className="lp-links">
            <Link href="#/components" tone="dim" underline="hover">
              Components
            </Link>
            <Link href="#agents" tone="dim" underline="hover">
              For agents
            </Link>
            <Link href={GITHUB} tone="dim" underline="hover" external>
              GitHub
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
