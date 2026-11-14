import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import * as Tree from './tree.tsx';

function Files(props: Partial<Tree.RootProps>): React.JSX.Element {
  return (
    <Tree.Root aria-label="Files" {...props}>
      <Tree.Item id="apps">
        <Tree.Label>apps</Tree.Label>
        <Tree.Group>
          <Tree.Item id="playground">
            <Tree.Label>playground</Tree.Label>
          </Tree.Item>
        </Tree.Group>
      </Tree.Item>
      <Tree.Item id="packages">
        <Tree.Label>packages</Tree.Label>
        <Tree.Meta>2</Tree.Meta>
        <Tree.Group>
          <Tree.Item id="react">
            <Tree.Label>react</Tree.Label>
          </Tree.Item>
          <Tree.Item id="tokens">
            <Tree.Label>tokens</Tree.Label>
          </Tree.Item>
        </Tree.Group>
      </Tree.Item>
      <Tree.Item id="readme">
        <Tree.Label>README.md</Tree.Label>
      </Tree.Item>
      <Tree.Item id="pkg">
        <Tree.Label>package.json</Tree.Label>
      </Tree.Item>
    </Tree.Root>
  );
}

function Controlled(): React.JSX.Element {
  const [expanded, setExpanded] = React.useState<readonly string[]>([]);
  const [selected, setSelected] = React.useState<readonly string[]>(['pkg']);
  return (
    <>
      <button type="button" onClick={() => setExpanded(['apps'])}>
        Open apps
      </button>
      <Files
        expanded={expanded}
        onExpandedChange={setExpanded}
        selected={selected}
        onSelectedChange={setSelected}
      />
    </>
  );
}

function Kids(): React.JSX.Element {
  return (
    <Tree.Group>
      <Tree.Item id="inner">
        <Tree.Label>inner</Tree.Label>
      </Tree.Item>
    </Tree.Group>
  );
}

const item = (name: string): HTMLElement => screen.getByRole('treeitem', { name });
const key = (el: Element, k: string, init: Partial<KeyboardEventInit> = {}): void => {
  fireEvent.keyDown(el, { key: k, ...init });
};

describe('Tree', () => {
  it('has tree semantics: level, set size, position, expanded only on parents', () => {
    render(<Files defaultExpanded={['packages']} />);
    expect(screen.getByRole('tree', { name: 'Files' })).toBeTruthy();
    const pkgs = item('packages');
    expect(pkgs.getAttribute('aria-level')).toBe('1');
    expect(pkgs.getAttribute('aria-expanded')).toBe('true');
    expect(pkgs.getAttribute('aria-setsize')).toBe('4');
    expect(pkgs.getAttribute('aria-posinset')).toBe('2');
    expect(item('apps').getAttribute('aria-expanded')).toBe('false');
    expect(item('README.md').hasAttribute('aria-expanded')).toBe(false);
    const tokens = item('tokens');
    expect(tokens.getAttribute('aria-level')).toBe('2');
    expect(tokens.getAttribute('aria-posinset')).toBe('2');
    expect(tokens.getAttribute('aria-setsize')).toBe('2');
    expect(screen.getByRole('group')).toBeTruthy();
    // the meta describes its item
    expect(pkgs.getAttribute('aria-describedby')).toBeTruthy();
    // closed groups aren't mounted
    expect(screen.queryByRole('treeitem', { name: 'playground' })).toBeNull();
  });

  it('keeps exactly one item in the tab order and moves it with focus', () => {
    render(<Files />);
    const items = screen.getAllByRole('treeitem');
    expect(items.map((i) => i.tabIndex)).toEqual([0, -1, -1, -1]);
    (items[0] as HTMLElement).focus();
    key(items[0] as HTMLElement, 'ArrowDown');
    expect(document.activeElement).toBe(items[1]);
    expect(items.map((i) => i.tabIndex)).toEqual([-1, 0, -1, -1]);
  });

  it('starts the tab order on the selected item', () => {
    render(<Files defaultSelected={['readme']} />);
    expect(item('README.md').tabIndex).toBe(0);
    expect(item('README.md').getAttribute('aria-selected')).toBe('true');
    // single selection: aria-selected only on the selected item
    expect(item('apps').hasAttribute('aria-selected')).toBe(false);
  });

  it('↑↓ Home End move through visible items', () => {
    render(<Files defaultExpanded={['packages']} />);
    const apps = item('apps');
    apps.focus();
    key(apps, 'End');
    expect(document.activeElement).toBe(item('package.json'));
    key(document.activeElement as Element, 'ArrowUp');
    expect(document.activeElement).toBe(item('README.md'));
    key(document.activeElement as Element, 'ArrowUp');
    expect(document.activeElement).toBe(item('tokens'));
    key(document.activeElement as Element, 'Home');
    expect(document.activeElement).toBe(apps);
  });

  it('→ opens then enters; ← climbs then closes', () => {
    const onExpandedChange = vi.fn<(ids: string[]) => void>();
    render(<Files onExpandedChange={onExpandedChange} />);
    const pkgs = item('packages');
    pkgs.focus();
    key(pkgs, 'ArrowRight');
    expect(pkgs.getAttribute('aria-expanded')).toBe('true');
    expect(onExpandedChange).toHaveBeenLastCalledWith(['packages']);
    expect(document.activeElement).toBe(pkgs);
    key(pkgs, 'ArrowRight');
    expect(document.activeElement).toBe(item('react'));
    key(document.activeElement as Element, 'ArrowLeft');
    expect(document.activeElement).toBe(pkgs);
    key(pkgs, 'ArrowLeft');
    expect(pkgs.getAttribute('aria-expanded')).toBe('false');
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);
    // a leaf: → does nothing
    const readme = item('README.md');
    readme.focus();
    key(readme, 'ArrowRight');
    expect(document.activeElement).toBe(readme);
  });

  it('* opens every sibling', () => {
    render(<Files />);
    const apps = item('apps');
    apps.focus();
    key(apps, '*');
    expect(apps.getAttribute('aria-expanded')).toBe('true');
    expect(item('packages').getAttribute('aria-expanded')).toBe('true');
  });

  it('typeahead jumps by label and cycles on a repeated letter', () => {
    vi.useFakeTimers();
    render(<Files defaultExpanded={['packages']} />);
    const apps = item('apps');
    apps.focus();
    key(apps, 'r');
    expect(document.activeElement).toBe(item('react'));
    key(document.activeElement as Element, 'r');
    expect(document.activeElement).toBe(item('README.md'));
    key(document.activeElement as Element, 'e');
    expect(document.activeElement).toBe(item('README.md'));
    vi.advanceTimersByTime(1000);
    key(document.activeElement as Element, 'p');
    expect(document.activeElement).toBe(item('package.json'));
    key(document.activeElement as Element, 'a');
    expect(document.activeElement).toBe(item('package.json'));
    vi.useRealTimers();
  });

  it('Enter activates and selects; a click on a parent opens it', () => {
    const onAction = vi.fn<(id: string) => void>();
    const onSelectedChange = vi.fn<(ids: string[]) => void>();
    render(<Files onAction={onAction} onSelectedChange={onSelectedChange} />);
    const readme = item('README.md');
    readme.focus();
    key(readme, 'Enter');
    expect(onAction).toHaveBeenCalledWith('readme');
    expect(onSelectedChange).toHaveBeenLastCalledWith(['readme']);
    expect(readme.getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByText('packages'));
    expect(item('packages').getAttribute('aria-expanded')).toBe('true');
    expect(onAction).toHaveBeenLastCalledWith('packages');
  });

  it('multiple: Space toggles, every item says selected or not, Ctrl+A selects all', () => {
    render(<Files selectionMode="multiple" />);
    expect(screen.getByRole('tree').getAttribute('aria-multiselectable')).toBe('true');
    const apps = item('apps');
    expect(apps.getAttribute('aria-selected')).toBe('false');
    apps.focus();
    key(apps, ' ');
    expect(apps.getAttribute('aria-selected')).toBe('true');
    key(apps, 'ArrowDown', { shiftKey: true });
    expect(item('packages').getAttribute('aria-selected')).toBe('true');
    key(document.activeElement as Element, ' ');
    expect(item('packages').getAttribute('aria-selected')).toBe('false');
    // a click doesn't open a parent in multiple mode — the chevron does
    fireEvent.click(screen.getByText('apps'));
    expect(apps.getAttribute('aria-expanded')).toBe('false');
    key(apps, 'a', { ctrlKey: true });
    expect(
      screen.getAllByRole('treeitem').every((i) => i.getAttribute('aria-selected') === 'true'),
    ).toBe(true);
  });

  it('none: no aria-selected, Space activates', () => {
    const onAction = vi.fn<(id: string) => void>();
    render(<Files selectionMode="none" onAction={onAction} />);
    const readme = item('README.md');
    expect(readme.hasAttribute('aria-selected')).toBe(false);
    readme.focus();
    key(readme, ' ');
    expect(onAction).toHaveBeenCalledWith('readme');
  });

  it('is controllable', () => {
    render(<Controlled />);
    expect(item('package.json').getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Open apps' }));
    expect(item('apps').getAttribute('aria-expanded')).toBe('true');
    expect(item('playground')).toBeTruthy();
  });

  it('a disabled item is focusable but does not open or select', () => {
    render(
      <Tree.Root aria-label="Settings">
        <Tree.Item id="labs" disabled>
          <Tree.Label>Labs</Tree.Label>
          <Tree.Group>
            <Tree.Item id="shuffle">
              <Tree.Label>Smart shuffle</Tree.Label>
            </Tree.Item>
          </Tree.Group>
        </Tree.Item>
      </Tree.Root>,
    );
    const labs = item('Labs');
    expect(labs.getAttribute('aria-disabled')).toBe('true');
    labs.focus();
    key(labs, 'ArrowRight');
    key(labs, 'Enter');
    expect(labs.getAttribute('aria-expanded')).toBe('false');
    expect(labs.hasAttribute('aria-selected')).toBe(false);
  });

  it('finds a Tree.Group inside your own component', () => {
    render(
      <Tree.Root aria-label="Wrapped" defaultExpanded={['outer']}>
        <Tree.Item id="outer">
          <Tree.Label>outer</Tree.Label>
          <Kids />
        </Tree.Item>
      </Tree.Root>,
    );
    expect(item('outer').getAttribute('aria-expanded')).toBe('true');
    expect(item('inner').getAttribute('aria-level')).toBe('2');
  });

  it('loads lazily: a loading row, then the children', async () => {
    let resolve: (() => void) | null = null;
    function Lazy(): React.JSX.Element {
      const [kids, setKids] = React.useState<string[] | null>(null);
      return (
        <Tree.Root aria-label="Drive">
          <Tree.Item
            id="tour"
            load={() =>
              new Promise<void>((r) => {
                resolve = () => {
                  setKids(['Setlist v3.pdf']);
                  r();
                };
              })
            }
          >
            <Tree.Label>Tour 2024</Tree.Label>
            {kids ? (
              <Tree.Group>
                {kids.map((k) => (
                  <Tree.Item key={k} id={k}>
                    <Tree.Label>{k}</Tree.Label>
                  </Tree.Item>
                ))}
              </Tree.Group>
            ) : null}
          </Tree.Item>
        </Tree.Root>
      );
    }
    render(<Lazy />);
    const tour = item('Tour 2024');
    expect(tour.getAttribute('aria-expanded')).toBe('false');
    tour.focus();
    await act(async () => key(tour, 'ArrowRight'));
    expect(screen.getByRole('group').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Loading')).toBeTruthy();
    await act(async () => resolve?.());
    expect(screen.getByRole('group').hasAttribute('aria-busy')).toBe(false);
    expect(item('Setlist v3.pdf').getAttribute('aria-level')).toBe('2');
  });

  it('a failed load offers a retry row that loads again', async () => {
    let calls = 0;
    function Flaky(): React.JSX.Element {
      const [kids, setKids] = React.useState<string[] | null>(null);
      return (
        <Tree.Root aria-label="Drive" defaultExpanded={['archive']}>
          <Tree.Item
            id="archive"
            load={async () => {
              calls += 1;
              if (calls === 1) throw new Error('offline');
              setKids(['Press shots.zip']);
            }}
          >
            <Tree.Label>Archive 2019</Tree.Label>
            {kids ? (
              <Tree.Group>
                {kids.map((k) => (
                  <Tree.Item key={k} id={k}>
                    <Tree.Label>{k}</Tree.Label>
                  </Tree.Item>
                ))}
              </Tree.Group>
            ) : null}
          </Tree.Item>
        </Tree.Root>
      );
    }
    render(<Flaky />);
    await act(async () => {});
    const failed = screen.getByRole('treeitem', { name: 'Couldn’t load Try again' });
    expect(failed.getAttribute('aria-level')).toBe('2');
    failed.focus();
    await act(async () => key(failed, 'Enter'));
    await act(async () => {});
    expect(calls).toBe(2);
    expect(item('Press shots.zip')).toBeTruthy();
  });

  it('an open item with no children says it is empty', async () => {
    render(
      <Tree.Root aria-label="Drive" defaultExpanded={['contracts']}>
        <Tree.Item id="contracts" load={async () => {}}>
          <Tree.Label>Contracts</Tree.Label>
        </Tree.Item>
      </Tree.Root>,
    );
    await act(async () => {});
    expect(screen.getByText('Empty')).toBeTruthy();
  });
});
