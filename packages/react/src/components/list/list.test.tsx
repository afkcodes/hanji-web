import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Chevron, Content, Item, Leading, Root, Title, Trailing, Value } from './list.tsx';

describe('List', () => {
  it('renders a ul of li rows with hanji classes', () => {
    render(
      <Root aria-label="Downloads">
        <Item>
          <Content>
            <Title>Quiet Machines</Title>
          </Content>
          <Trailing>
            <Value>58:12</Value>
          </Trailing>
        </Item>
      </Root>,
    );
    const list = screen.getByRole('list', { name: 'Downloads' });
    expect(list.tagName).toBe('UL');
    expect(list.hasAttribute('data-divided')).toBe(true);
    const item = screen.getByRole('listitem');
    expect(item.className).toBe('hj-list-item');
    expect(item.firstElementChild?.className).toBe('hj-list-row');
    expect(item.hasAttribute('data-interactive')).toBe(false);
  });

  it('render makes the inner row a link and keeps the li', () => {
    render(
      <Root>
        <Item
          selected
          render={(props) => (
            <a {...props} href="#a">
              {props.children}
            </a>
          )}
        >
          <Leading variant="icon" tone="accent">
            ★
          </Leading>
          <Content>
            <Title>Late Light</Title>
          </Content>
          <Chevron />
        </Item>
      </Root>,
    );
    const link = screen.getByRole('link', { name: /Late Light/ });
    expect(link.className).toBe('hj-list-row');
    expect(link.getAttribute('aria-current')).toBe('true');
    const li = link.parentElement as HTMLElement;
    expect(li.tagName).toBe('LI');
    expect(li.hasAttribute('data-interactive')).toBe(true);
    expect(li.hasAttribute('data-selected')).toBe(true);
    const lead = li.querySelector('.hj-list-leading');
    expect(lead?.getAttribute('data-variant')).toBe('icon');
    expect(lead?.getAttribute('data-tone')).toBe('accent');
  });

  it('disabled interactive rows leave the tab order', () => {
    render(
      <Root>
        <Item
          disabled
          render={(props) => (
            <a {...props} href="#b">
              {props.children}
            </a>
          )}
        >
          <Title>Seoul</Title>
        </Item>
      </Root>,
    );
    const link = screen.getByRole('link', { name: 'Seoul' });
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.tabIndex).toBe(-1);
  });
});
