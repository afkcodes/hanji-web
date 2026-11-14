import {
  Badge,
  Button,
  Chip,
  CodeBlock,
  Field,
  Link,
  SegmentedControl,
  Select,
  Status,
  Switch,
  Text,
  Theme,
} from '@hanji/react';
import type { StatusTone, ThemeInput } from '@hanji/react';
import { accentNames, accents, createTheme, dataSeries } from '@hanji/tokens';
import * as React from 'react';

type GroundKind = 'preset' | 'tint' | 'colours';
type Mode = 'light' | 'dark' | 'auto';
type Preset = 'paper' | 'ink' | 'charcoal' | 'auto';
type AccentName = (typeof accentNames)[number];

interface Lab {
  ground: GroundKind;
  preset: Preset;
  tint: string;
  mode: Mode;
  bg: string;
  fg: string;
  accentKind: 'preset' | 'custom';
  accentName: AccentName;
  accentLight: string;
  accentDark: string;
  danger: string | null;
  data: string[];
  radius: 'sharp' | 'soft' | 'round';
}

const HANJI_DATA = dataSeries.map((n) => accents[n].light);

const RECIPES: { name: string; lab: Partial<Lab> }[] = [
  {
    name: 'Navy ledger',
    lab: {
      ground: 'tint',
      tint: '#1e3a5f',
      mode: 'light',
      accentKind: 'custom',
      accentLight: '#0b6bcb',
      accentDark: '#5aa9ff',
      danger: null,
      data: ['#0b6bcb', '#c2541c', '#16805c', '#7a46b8', '#946a00', '#0b7a87'],
      radius: 'soft',
    },
  },
  {
    name: 'Forest, dark',
    lab: {
      ground: 'tint',
      tint: '#2f5d3a',
      mode: 'dark',
      accentKind: 'custom',
      accentLight: '#1f7a4a',
      accentDark: '#7fdca4',
      danger: null,
      data: HANJI_DATA,
      radius: 'round',
    },
  },
  {
    name: 'Red brand',
    lab: {
      ground: 'colours',
      bg: '#f6f3ef',
      fg: '#1c1a17',
      accentKind: 'custom',
      accentLight: '#c8102e',
      accentDark: '#ff4d5e',
      danger: null,
      data: HANJI_DATA,
      radius: 'sharp',
    },
  },
  {
    name: 'White and yellow',
    lab: {
      ground: 'colours',
      bg: '#ffffff',
      fg: '#111111',
      accentKind: 'custom',
      accentLight: '#ffcc00',
      accentDark: '#ffcc00',
      danger: null,
      data: ['#2848c9', '#2a4bd0', '#e6e6e6', '#237a46', '#9a6b00', '#0f7f76'],
      radius: 'soft',
    },
  },
  {
    name: 'hanji',
    lab: {
      ground: 'preset',
      preset: 'paper',
      accentKind: 'preset',
      accentName: 'scarlet',
      danger: null,
      data: HANJI_DATA,
      radius: 'soft',
    },
  },
];

const START: Lab = {
  ground: 'tint',
  preset: 'paper',
  tint: '#1e3a5f',
  mode: 'light',
  bg: '#f4f1ea',
  fg: '#1d1b17',
  accentKind: 'custom',
  accentName: 'cobalt',
  accentLight: '#0b6bcb',
  accentDark: '#5aa9ff',
  danger: null,
  data: HANJI_DATA,
  radius: 'soft',
  ...RECIPES[0]?.lab,
};

function toInput(l: Lab): ThemeInput {
  const paper: ThemeInput['paper'] =
    l.ground === 'preset'
      ? l.preset
      : l.ground === 'tint'
        ? { tint: l.tint, mode: l.mode }
        : { bg: l.bg, fg: l.fg };
  const input: ThemeInput = {
    paper,
    accent: l.accentKind === 'preset' ? l.accentName : { light: l.accentLight, dark: l.accentDark },
    radius: l.radius,
  };
  if (l.danger) input.colors = { danger: l.danger };
  if (l.data.some((c, i) => c !== HANJI_DATA[i])) input.data = l.data;
  return input;
}

function toJsx(input: ThemeInput): string {
  const props = Object.entries(input)
    .map(([k, v]) => (typeof v === 'string' ? `  ${k}="${v}"` : `  ${k}={${JSON.stringify(v)}}`))
    .join('\n');
  return `<Theme\n${props}\n>\n  <App />\n</Theme>`;
}

function Swatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <label className="pg-lab-swatch">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <span>
        {label}
        <code>{value}</code>
      </span>
    </label>
  );
}

const PAYMENTS: { who: string; amount: string; tone: StatusTone; word: string }[] = [
  { who: 'Kestrel Freight', amount: '−£146.82', tone: 'danger', word: 'Failed' },
  { who: 'Aiko Sato', amount: '+£135.43', tone: 'pending', word: 'Pending' },
  { who: 'Sato & Haddad LLP', amount: '−£34.62', tone: 'success', word: 'Paid' },
  { who: 'Brandt Architekten', amount: '−€168.21', tone: 'warning', word: 'Needs review' },
  { who: 'Harbour & Finch', amount: '−£95.99', tone: 'info', word: 'Scheduled' },
  { who: 'Jun-seo Park', amount: '−£40.81', tone: 'neutral', word: 'Settled' },
];
const CHART = [64, 88, 52, 76, 40, 58];

function Preview(): React.JSX.Element {
  return (
    <div className="pg-lab-sheet">
      <div>
        <Text variant="eyebrow" tone="mute">
          Thursday 14 November
        </Text>
        <Text variant="title">Good morning, Mira</Text>
        <Text tone="dim">
          Three payments need you today. Spending is down 4.2% on last month.{' '}
          <Link href="#/theme">See the breakdown</Link>
        </Text>
      </div>
      <div className="pg-lab-row">
        <Button>Pay invoices</Button>
        <Button variant="secondary">Schedule</Button>
        <Button variant="quiet">Details</Button>
        <Button variant="danger">Cancel payment</Button>
      </div>
      <div className="pg-lab-row">
        <SegmentedControl.Root aria-label="Period" defaultValue="week" size="sm">
          <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
          <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
          <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
        </SegmentedControl.Root>
        <Chip.Root defaultPressed>Recurring</Chip.Root>
        <Chip.Root>One-off</Chip.Root>
        <div className="pg-lab-switch">
          <Switch.Root defaultChecked aria-label="Round up to savings" />
          <span aria-hidden="true">Round up</span>
        </div>
        <Badge.Root count={3} label="3 need you" />
      </div>
      <div className="pg-lab-card">
        {PAYMENTS.map((p) => (
          <div key={p.who} className="pg-lab-payment">
            <span>{p.who}</span>
            <span className="pg-lab-amount">{p.amount}</span>
            <Status tone={p.tone} variant={p.tone === 'neutral' ? 'plain' : 'tint'}>
              {p.word}
            </Status>
          </div>
        ))}
      </div>
      <div className="pg-lab-split">
        <Field.Root>
          <Field.Label>Reference</Field.Label>
          <Field.Control defaultValue="INV-5389" />
          <Field.Description>Shown on the payee’s statement.</Field.Description>
        </Field.Root>
        <Field.Root>
          <Select.Root
            items={[
              { value: 'now', label: 'Today' },
              { value: 'friday', label: 'Friday' },
            ]}
            defaultValue="now"
          >
            <Select.Label>Pay on</Select.Label>
            <Select.Trigger />
            <Select.Content>
              <Select.Option value="now">Today</Select.Option>
              <Select.Option value="friday">Friday</Select.Option>
            </Select.Content>
          </Select.Root>
        </Field.Root>
      </div>
      <figure className="pg-lab-chart" aria-label="Spending by category, chart colours 1 to 6">
        {CHART.map((h, i) => (
          <span
            // oxlint-disable-next-line react/no-array-index-key -- six fixed series
            key={i}
            style={{ height: `${h}%`, background: `var(--hj-data-${i + 1})` }}
          />
        ))}
      </figure>
    </div>
  );
}

export function ThemePage(): React.JSX.Element {
  const [lab, setLab] = React.useState<Lab>(START);
  const set = <K extends keyof Lab>(k: K, v: Lab[K]): void => setLab((l) => ({ ...l, [k]: v }));
  const input = React.useMemo(() => toInput(lab), [lab]);
  const theme = React.useMemo(() => createTheme(input), [input]);
  return (
    <article className="pg-page pg-lab">
      <div className="pg-eyebrow">
        foundation · <span data-status="new">new</span>
      </div>
      <h1>Theme</h1>
      <p className="pg-lede">
        Your own neutrals, accent, status and chart colours. Every text colour is measured against
        your grounds and nudged to 4.5:1; an accent that could pass for danger hands “pending” to
        info; anything that still reads poorly is named below.
      </p>
      <div className="pg-lab-recipes">
        {RECIPES.map((r) => (
          <Button
            key={r.name}
            size="sm"
            variant="secondary"
            onClick={() => setLab((l) => ({ ...l, ...r.lab }))}
          >
            {r.name}
          </Button>
        ))}
      </div>

      <div className="pg-lab-grid">
        <div className="pg-lab-controls">
          <section>
            <h3>Ground</h3>
            <SegmentedControl.Root
              aria-label="Ground"
              size="sm"
              block
              value={lab.ground}
              onValueChange={(v) => set('ground', v as GroundKind)}
            >
              <SegmentedControl.Item value="preset">Preset</SegmentedControl.Item>
              <SegmentedControl.Item value="tint">Tint</SegmentedControl.Item>
              <SegmentedControl.Item value="colours">Colours</SegmentedControl.Item>
            </SegmentedControl.Root>
            {lab.ground === 'preset' ? (
              <SegmentedControl.Root
                aria-label="Paper"
                size="sm"
                block
                value={lab.preset}
                onValueChange={(v) => set('preset', v as Preset)}
              >
                {(['paper', 'ink', 'charcoal', 'auto'] as const).map((p) => (
                  <SegmentedControl.Item key={p} value={p}>
                    {p}
                  </SegmentedControl.Item>
                ))}
              </SegmentedControl.Root>
            ) : lab.ground === 'tint' ? (
              <>
                <Swatch label="Tint" value={lab.tint} onChange={(v) => set('tint', v)} />
                <SegmentedControl.Root
                  aria-label="Scheme"
                  size="sm"
                  block
                  value={lab.mode}
                  onValueChange={(v) => set('mode', v as Mode)}
                >
                  {(['light', 'dark', 'auto'] as const).map((m) => (
                    <SegmentedControl.Item key={m} value={m}>
                      {m}
                    </SegmentedControl.Item>
                  ))}
                </SegmentedControl.Root>
              </>
            ) : (
              <>
                <Swatch label="Background" value={lab.bg} onChange={(v) => set('bg', v)} />
                <Swatch label="Ink" value={lab.fg} onChange={(v) => set('fg', v)} />
              </>
            )}
          </section>
          <section>
            <h3>Accent</h3>
            <SegmentedControl.Root
              aria-label="Accent source"
              size="sm"
              block
              value={lab.accentKind}
              onValueChange={(v) => set('accentKind', v as Lab['accentKind'])}
            >
              <SegmentedControl.Item value="preset">Preset</SegmentedControl.Item>
              <SegmentedControl.Item value="custom">Custom</SegmentedControl.Item>
            </SegmentedControl.Root>
            {lab.accentKind === 'preset' ? (
              <Select.Root
                items={accentNames.map((n) => ({ value: n, label: n }))}
                value={lab.accentName}
                onValueChange={(v) => v && set('accentName', v as AccentName)}
              >
                <Select.Label className="hj-sr-only">Preset accent</Select.Label>
                <Select.Trigger />
                <Select.Content>
                  {accentNames.map((n) => (
                    <Select.Option key={n} value={n}>
                      {n}
                    </Select.Option>
                  ))}
                </Select.Content>
              </Select.Root>
            ) : (
              <>
                <Swatch
                  label="On light"
                  value={lab.accentLight}
                  onChange={(v) => set('accentLight', v)}
                />
                <Swatch
                  label="On dark"
                  value={lab.accentDark}
                  onChange={(v) => set('accentDark', v)}
                />
              </>
            )}
          </section>
          <section>
            <h3>Danger</h3>
            <div className="pg-lab-switch">
              <Switch.Root
                checked={lab.danger !== null}
                onCheckedChange={(on) => set('danger', on ? '#d92d20' : null)}
                aria-label="Custom danger colour"
              />
              <span aria-hidden="true">Custom</span>
            </div>
            {lab.danger !== null ? (
              <Swatch label="Danger" value={lab.danger} onChange={(v) => set('danger', v)} />
            ) : null}
          </section>
          <section>
            <h3>Chart colours</h3>
            <div className="pg-lab-data">
              {lab.data.map((c, i) => (
                <Swatch
                  // oxlint-disable-next-line react/no-array-index-key -- six fixed series
                  key={i}
                  label={`${i + 1}`}
                  value={c}
                  onChange={(v) =>
                    set(
                      'data',
                      lab.data.map((x, j) => (j === i ? v : x)),
                    )
                  }
                />
              ))}
            </div>
          </section>
          <section>
            <h3>Corners</h3>
            <SegmentedControl.Root
              aria-label="Corners"
              size="sm"
              block
              value={lab.radius}
              onValueChange={(v) => set('radius', v as Lab['radius'])}
            >
              {(['sharp', 'soft', 'round'] as const).map((r) => (
                <SegmentedControl.Item key={r} value={r}>
                  {r}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </section>
        </div>

        <div className="pg-lab-out">
          <Theme theme={theme} surface className="pg-lab-stage">
            <Preview />
          </Theme>
          <section className="pg-lab-warnings" aria-live="polite">
            <h3>
              {theme.warnings.length
                ? `${theme.warnings.length} to look at`
                : 'Nothing to fix — every text colour reads at 4.5:1'}
            </h3>
            {theme.warnings.map((w) => (
              <p key={w.message}>
                <Status tone="warning" variant="plain">
                  {w.code}
                </Status>
                <span>{w.message}</span>
              </p>
            ))}
          </section>
          <CodeBlock.Root language="tsx" className="pg-code">
            <CodeBlock.Header>
              <CodeBlock.Language />
              <CodeBlock.Actions>
                <CodeBlock.Copy />
              </CodeBlock.Actions>
            </CodeBlock.Header>
            <CodeBlock.Code code={toJsx(input)} />
          </CodeBlock.Root>
        </div>
      </div>
    </article>
  );
}
