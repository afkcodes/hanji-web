import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import * as Command from './command.tsx';

/** Options in what the user sees: CSS `order` while ranking, DOM order otherwise. */
function rank(el: HTMLElement): number {
  const own = Number(el.style.order || 0);
  const group = el.closest<HTMLElement>('[role="group"]');
  return group ? Number(group.style.order || 0) * 1000 + own : own * 1000;
}

function visibleOptions(): string[] {
  const options = screen.queryAllByRole('option');
  const anyOrdered = options.some((o) => o.style.order !== '');
  const list = anyOrdered ? options.toSorted((a, b) => rank(a) - rank(b)) : options;
  return list.map((o) => (o.textContent ?? '').trim());
}

function highlighted(): string {
  return (document.querySelector('[data-highlighted]')?.textContent ?? '').trim();
}

function Palette({
  onSelect,
  filter,
}: {
  onSelect?: (v: string) => void;
  filter?: boolean;
}): React.JSX.Element {
  return (
    <Command.Root filter={filter}>
      <Command.Input placeholder="Type a command" />
      <Command.List>
        <Command.Group label="Navigate">
          <Command.Item onSelect={onSelect}>Go to inbox</Command.Item>
          <Command.Item onSelect={onSelect}>Go to projects</Command.Item>
          <Command.Item onSelect={onSelect} keywords={['preferences']}>
            Open settings
          </Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Group label="Actions">
          <Command.Item onSelect={onSelect}>
            New document
            <Command.Shortcut keys={['mod', 'N']} />
          </Command.Item>
          <Command.Item onSelect={onSelect}>Invite teammate</Command.Item>
          <Command.Item onSelect={onSelect} page="theme">
            Change theme…
          </Command.Item>
          <Command.Item onSelect={onSelect} disabled>
            Archive project
          </Command.Item>
        </Command.Group>
        <Command.Page id="theme" label="Theme">
          <Command.Item onSelect={onSelect}>Paper</Command.Item>
          <Command.Item onSelect={onSelect}>Ink</Command.Item>
        </Command.Page>
      </Command.List>
      <Command.Empty />
    </Command.Root>
  );
}

function Async(): React.JSX.Element {
  const [q, setQ] = React.useState('');
  return (
    <Command.Root query={q} onQueryChange={setQ}>
      <Command.Input />
      <Command.Loading loading={q === 'wait'}>Searching people…</Command.Loading>
      <Command.List>
        <Command.Item>Mira Okafor</Command.Item>
        {q ? <Command.Item forceMount>{`Ask hanji about “${q}”`}</Command.Item> : null}
      </Command.List>
      <Command.Empty>{(query) => `Nobody called “${query}”`}</Command.Empty>
    </Command.Root>
  );
}

function Late(): React.JSX.Element {
  const [q, setQ] = React.useState('');
  const [rows, setRows] = React.useState<string[]>([]);
  return (
    <Command.Root
      filter={false}
      query={q}
      onQueryChange={(next) => {
        setQ(next);
        setRows([]);
        window.setTimeout(() => setRows(['Aiko Sato', 'Mira Okafor']), 20);
      }}
    >
      <Command.Input />
      <Command.List>
        {rows.map((r) => (
          <Command.Item key={r}>{r}</Command.Item>
        ))}
      </Command.List>
    </Command.Root>
  );
}

describe('defaultFilter', () => {
  it('ranks exact > prefix > word start > initials > substring > fuzzy, ignoring case and accents', () => {
    const f = Command.defaultFilter;
    expect(f('Inbox', 'inbox')).toBe(1);
    expect(f('Inbox', 'in')).toBeGreaterThan(f('Go to inbox', 'in'));
    expect(f('Go to inbox', 'inb')).toBeGreaterThan(f('Change theme', 'ct'));
    expect(f('Change theme', 'ct')).toBeGreaterThan(f('Select tag', 'ct'));
    expect(f('Select tag', 'ct')).toBeGreaterThan(f('Settings', 'stg'));
    expect(f('Settings', 'stg')).toBeGreaterThan(0);
    expect(f('Settings', 'xyz')).toBe(0);
    expect(f('Tomás Reyes', 'tomas')).toBeGreaterThan(0.8);
    expect(f('Open settings', 'prefs', ['preferences'])).toBeGreaterThan(0);
    expect(f('Create new document', 'doc new')).toBeGreaterThan(0);
  });
});

describe('Command', () => {
  it('filters, ranks the best match first, and hides groups with no matches', async () => {
    render(<Palette />);
    const input = screen.getByRole('combobox', { name: 'Search commands' });
    expect(visibleOptions()).toHaveLength(7);
    expect(document.querySelectorAll('.hj-command-separator')).toHaveLength(1);

    await userEvent.type(input, 'in');
    // “Invite teammate” (prefix) outranks “Go to inbox” (word start), so Actions moves up.
    await waitFor(() => expect(visibleOptions()[0]).toBe('Invite teammate'));
    expect(visibleOptions()).toEqual(['Invite teammate', 'Go to inbox', 'Open settings']);
    expect(highlighted()).toBe('Invite teammate');
    // separators hide while results are reordered by relevance
    expect(document.querySelectorAll('.hj-command-separator')).toHaveLength(0);

    await userEvent.clear(input);
    await userEvent.type(input, 'prefer');
    await waitFor(() => expect(visibleOptions()).toEqual(['Open settings']));
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups.filter((g) => g.hidden)).toHaveLength(1);
  });

  it('moves with the arrow keys in ranked order and runs the command on Enter', async () => {
    const onSelect = vi.fn<(value: string) => void>();
    render(<Palette onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'in');
    await waitFor(() => expect(highlighted()).toBe('Invite teammate'));
    await userEvent.keyboard('{ArrowDown}');
    expect(highlighted()).toBe('Go to inbox');
    expect(input.getAttribute('aria-activedescendant')).toBe(
      document.querySelector('[data-highlighted]')?.id,
    );
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('Go to inbox');
    // Running a command never writes it into the field.
    expect((input as HTMLInputElement).value).toBe('in');
  });

  it('says what was searched when nothing matches', async () => {
    render(<Palette />);
    await userEvent.type(screen.getByRole('combobox'), 'zzq');
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe('No results for “zzq”'),
    );
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('shows everything as rendered with filter={false}', async () => {
    render(<Palette filter={false} />);
    await userEvent.type(screen.getByRole('combobox'), 'zzq');
    expect(screen.getAllByRole('option')).toHaveLength(7);
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('opens a page with a breadcrumb chip; Backspace on an empty field goes back', async () => {
    const onSelect = vi.fn<(value: string) => void>();
    render(<Palette onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'theme');
    await waitFor(() => expect(highlighted()).toBe('Change theme…'));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(visibleOptions()).toEqual(['Paper', 'Ink']));
    // The page starts fresh: empty field, focus kept, first command highlighted.
    const field = screen.getByRole('combobox') as HTMLInputElement;
    expect(field.value).toBe('');
    expect(document.activeElement).toBe(field);
    expect(highlighted()).toBe('Paper');
    expect(screen.getByRole('button', { name: 'Back — Theme' })).toBeTruthy();
    await userEvent.keyboard('{ArrowDown}');
    expect(highlighted()).toBe('Ink');
    await userEvent.keyboard('{Backspace}');
    await waitFor(() => expect(visibleOptions()).toHaveLength(7));
    expect(highlighted()).toBe('Go to inbox');
    expect(document.activeElement).toBe(screen.getByRole('combobox'));
    expect(screen.queryByRole('button', { name: 'Back — Theme' })).toBeNull();
  });

  it('Escape clears the query first, then leaves the page', async () => {
    render(<Palette />);
    await userEvent.click(screen.getAllByRole('option')[5] as HTMLElement); // Change theme…
    await waitFor(() => expect(visibleOptions()).toEqual(['Paper', 'Ink']));
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.type(input, 'nk');
    expect(visibleOptions()).toEqual(['Ink']);
    await userEvent.keyboard('{Escape}');
    expect(input.value).toBe('');
    expect(visibleOptions()).toEqual(['Paper', 'Ink']);
    expect(highlighted()).toBe('Paper');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(visibleOptions()).toHaveLength(7));
  });

  it('does not run disabled commands', async () => {
    const onSelect = vi.fn<(value: string) => void>();
    render(<Palette onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Archive project'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('keeps forceMount rows and holds Empty back while loading', async () => {
    render(<Async />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'wait');
    expect(visibleOptions()).toEqual(['Ask hanji about “wait”']);
    expect(screen.getByText('Searching people…')).toBeTruthy();
    expect(screen.queryByText(/Nobody called/)).toBeNull();
    await userEvent.type(input, 's');
    await waitFor(() => expect(screen.getByText('Nobody called “waits”')).toBeTruthy());
  });

  it('highlights the first result when async results arrive after typing', async () => {
    render(<Late />);
    await userEvent.type(screen.getByRole('combobox'), 'a');
    await waitFor(() => expect(visibleOptions()).toHaveLength(2));
    await waitFor(() => expect(highlighted()).toBe('Aiko Sato'));
  });

  it('Dialog toggles on mod+K, labels itself, and closes after a command runs', async () => {
    const onSelect = vi.fn<(value: string) => void>();
    render(
      <Command.Dialog>
        <Command.Input />
        <Command.List>
          <Command.Item onSelect={onSelect}>Go to inbox</Command.Item>
        </Command.List>
      </Command.Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await act(async () => {
      const mod = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
        ? { metaKey: true }
        : { ctrlKey: true };
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ...mod }));
    });
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeTruthy(),
    );
    await userEvent.click(screen.getByRole('option', { name: 'Go to inbox' }));
    expect(onSelect).toHaveBeenCalledWith('Go to inbox');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('Shortcut draws keys and stays out of the match text', () => {
    render(<Palette />);
    const row = screen.getByText('New document').closest('[role="option"]') as HTMLElement;
    expect(row.querySelectorAll('kbd')).toHaveLength(2);
  });
});
