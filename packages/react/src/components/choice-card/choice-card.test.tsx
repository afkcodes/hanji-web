import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Consequence, Item, Root, Title } from './choice-card.tsx';

describe('ChoiceCard', () => {
  it('is a radiogroup of cards with a corner ring', async () => {
    render(
      <Root aria-label="Plan" defaultValue="solo" columns={2}>
        <Item value="solo">
          <Title>Solo</Title>
          <Consequence>£10.99</Consequence>
        </Item>
        <Item value="family">
          <Title>Family</Title>
          <Consequence>£16.99</Consequence>
        </Item>
      </Root>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Plan' });
    expect(group.getAttribute('data-columns')).toBe('2');
    const family = screen.getByRole('radio', { name: /Family/ });
    expect(family.className).toBe('hj-choice-card-item');
    expect(family.querySelector('.hj-choice-card-ring')).not.toBeNull();
    await userEvent.click(family);
    expect(family.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: /Solo/ }).getAttribute('aria-checked')).toBe('false');
  });

  it('can drop the ring', () => {
    render(
      <Root aria-label="x">
        <Item value="a" indicator={false}>
          A
        </Item>
      </Root>,
    );
    expect(
      screen.getByRole('radio', { name: 'A' }).querySelector('.hj-choice-card-ring'),
    ).toBeNull();
  });
});
