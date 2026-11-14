import { CodeBlock, SegmentedControl, Select, Toggle } from '@hanji/react';
import { accentNames, accents } from '@hanji/tokens';
import * as React from 'react';

import { Landing } from './landing.tsx';
import { categories, entries } from './registry.ts';
import type { Entry } from './registry.ts';

type Settings = { paper: string; accent: string; density: string; motion: string };
const KEY = 'hanji.playground';

function useSettings(): [Settings, (k: keyof Settings, v: string) => void] {
  const [s, setS] = React.useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) return JSON.parse(saved) as Settings;
    } catch {
      /* private mode */
    }
    return { paper: 'paper', accent: 'scarlet', density: 'cozy', motion: 'system' };
  });
  React.useEffect(() => {
    const el = document.documentElement;
    el.dataset.hjPaper = s.paper;
    el.dataset.hjAccent = s.accent;
    el.dataset.hjDensity = s.density;
    el.dataset.hjMotion = s.motion;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* private mode */
    }
  }, [s]);
  return [s, (k, v) => setS((prev) => ({ ...prev, [k]: v }))];
}

/**
 * `#/` (or an in-page anchor such as `#agents`) is the landing page; `#/components` opens the
 * showcase at its first component; `#/<slug>` opens that component.
 */
const readRoute = (): string => {
  const h = location.hash;
  if (!h.startsWith('#/')) return '';
  const r = decodeURIComponent(h.slice(2));
  return r === 'components' ? (entries[0]?.meta.slug ?? '') : r;
};

function useRoute(): string {
  const [route, setRoute] = React.useState(readRoute);
  React.useEffect(() => {
    const on = (): void => {
      const next = readRoute();
      setRoute(next);
      // A new page starts at the top; an anchor on the landing page is left to the browser.
      if (location.hash.startsWith('#/')) window.scrollTo({ top: 0 });
    };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return route;
}

const cap = (v: string): string => v.charAt(0).toUpperCase() + v.slice(1);

/** A labelled segmented control for the appearance bar. */
function Segments({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <div className="pg-tool">
      <span aria-hidden="true">{label}</span>
      <SegmentedControl.Root
        size="sm"
        aria-label={label}
        value={value}
        onValueChange={(v) => onChange(String(v))}
      >
        {options.map((o) => (
          <SegmentedControl.Item key={o} value={o}>
            {cap(o)}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
    </div>
  );
}

/** light-dark() picks the accent's stop for whichever paper the swatch sits on. */
function Swatch({ name }: { name: (typeof accentNames)[number] }): React.JSX.Element {
  const ramp = accents[name];
  return (
    <i className="pg-swatch" style={{ background: `light-dark(${ramp.light}, ${ramp.dark})` }} />
  );
}

const accentItems = accentNames.map((n) => ({ value: n, label: cap(n) }));

function AccentPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <div className="pg-tool">
      <span aria-hidden="true">Accent</span>
      <Select.Root items={accentItems} value={value} onValueChange={(v) => onChange(String(v))}>
        <Select.Trigger size="sm" aria-label="Accent" className="pg-accent-trigger">
          <Select.Value>
            {(v: string) => (
              <span className="pg-accent-value">
                <Swatch name={v as (typeof accentNames)[number]} />
                {cap(v)}
              </span>
            )}
          </Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Content alignItemWithTrigger={false}>
          {accentNames.map((n) => (
            <Select.Option key={n} value={n}>
              <span className="pg-accent-value">
                <Swatch name={n} />
                {cap(n)}
              </span>
            </Select.Option>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
}

function Example({ ex, slug }: { ex: Entry['examples'][number]; slug: string }): React.JSX.Element {
  const [code, setCode] = React.useState(false);
  return (
    <section className="pg-example" id={`ex-${ex.file}`}>
      <header>
        <div>
          <h3>{ex.title}</h3>
          <p>{ex.description}</p>
        </div>
        <Toggle size="sm" variant="outline" pressed={code} onPressedChange={setCode}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
          </svg>
          Code
        </Toggle>
      </header>
      <div className="pg-plate" data-testid={`plate-${ex.file}`}>
        <ex.Example />
      </div>
      {code ? (
        <CodeBlock.Root language="tsx" lineNumbers className="pg-code">
          <CodeBlock.Header>
            <CodeBlock.Language />
            <CodeBlock.Filename>{`${slug}/examples/${ex.file}.tsx`}</CodeBlock.Filename>
            <CodeBlock.Actions>
              <CodeBlock.WrapToggle />
              <CodeBlock.Copy />
            </CodeBlock.Actions>
          </CodeBlock.Header>
          <CodeBlock.Code code={ex.source} />
        </CodeBlock.Root>
      ) : null}
    </section>
  );
}

function Page({ entry }: { entry: Entry }): React.JSX.Element {
  const m = entry.meta;
  return (
    <article className="pg-page">
      <div className="pg-eyebrow">
        {m.category} · <span data-status={m.status}>{m.status}</span>
      </div>
      <h1>{m.name}</h1>
      <p className="pg-lede">{m.description}</p>
      <CodeBlock.Snippet language="tsx" code={m.import} className="pg-import" />
      <div className="pg-use">
        <div>
          <h4>Use it for</h4>
          <ul>
            {m.whenToUse.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Not for</h4>
          <ul>
            {m.whenNotToUse.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>
      {entry.examples.map((ex) => (
        <Example key={ex.file} ex={ex} slug={m.slug} />
      ))}
      <h2>Anatomy</h2>
      <div className="pg-parts">
        {m.parts.map((p) => (
          <section key={p.name}>
            <h3>
              {m.parts.length > 1 ? `${m.name}.${p.name}` : p.name} <code>&lt;{p.element}&gt;</code>
            </h3>
            <p>{p.description}</p>
            <dl>
              {p.base ? (
                <>
                  <dt>Base UI</dt>
                  <dd>{p.base}</dd>
                </>
              ) : null}
              {p.className ? (
                <>
                  <dt>Class</dt>
                  <dd>.{p.className}</dd>
                </>
              ) : null}
              <dt>Slot</dt>
              <dd>{p.slot}</dd>
            </dl>
            {p.props ? (
              <table>
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(p.props).map(([k, d]) => (
                    <tr key={k}>
                      <td>
                        <code>{k}</code>
                      </td>
                      <td>
                        <code>{d.type}</code>
                      </td>
                      <td>{d.default ?? '—'}</td>
                      <td>{d.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {p.dataAttributes ? (
              <table>
                <thead>
                  <tr>
                    <th>Data attribute</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(p.dataAttributes).map(([k, d]) => (
                    <tr key={k}>
                      <td>
                        <code>{k}</code>
                      </td>
                      <td>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {p.cssVars ? (
              <table>
                <thead>
                  <tr>
                    <th>CSS variable</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(p.cssVars).map(([k, d]) => (
                    <tr key={k}>
                      <td>
                        <code>{k}</code>
                      </td>
                      <td>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </section>
        ))}
      </div>
      <div className="pg-use">
        <div>
          <h4>Accessibility</h4>
          <ul>
            {m.accessibility.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
        {m.motion ? (
          <div>
            <h4>Motion</h4>
            <p>{m.motion}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function App(): React.JSX.Element {
  const [s, set] = useSettings();
  const route = useRoute();
  const entry = entries.find((e) => e.meta.slug === route) ?? entries[0];
  // Arriving on the landing page from elsewhere with an anchor (#agents): scroll once it exists.
  React.useEffect(() => {
    if (route !== '' || location.hash.length < 2 || location.hash.startsWith('#/')) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [route]);
  if (route === '') {
    return (
      <Landing
        paper={s.paper}
        accent={s.accent}
        density={s.density}
        onPaper={(v) => set('paper', v)}
        onAccent={(v) => set('accent', v)}
      />
    );
  }
  return (
    <div className="pg">
      <header className="pg-bar">
        <a className="pg-brand" href="#/">
          <span className="pg-seal">한지</span> hanji{' '}
          <small>react · {entries.length} components</small>
        </a>
        <div className="pg-tools">
          <Segments
            label="Paper"
            value={s.paper}
            options={['paper', 'ink', 'charcoal', 'auto']}
            onChange={(v) => set('paper', v)}
          />
          <AccentPicker value={s.accent} onChange={(v) => set('accent', v)} />
          <Segments
            label="Density"
            value={s.density}
            options={['cozy', 'compact']}
            onChange={(v) => set('density', v)}
          />
          <Segments
            label="Motion"
            value={s.motion}
            options={['system', 'full', 'reduced']}
            onChange={(v) => set('motion', v)}
          />
        </div>
      </header>
      <nav className="pg-nav" aria-label="Components">
        {categories.map((c) => (
          <div key={c.id}>
            <h5>{c.id}</h5>
            {c.items.map((e) => (
              <a
                key={e.meta.slug}
                href={`#/${e.meta.slug}`}
                aria-current={e === entry ? 'page' : undefined}
              >
                {e.meta.name}
                {e.meta.status === 'new' ? <i>new</i> : null}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <main className="pg-main">
        {entry ? <Page key={entry.meta.slug} entry={entry} /> : <p>No components yet.</p>}
      </main>
    </div>
  );
}
