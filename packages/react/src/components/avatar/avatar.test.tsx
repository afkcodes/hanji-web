import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Group, Root, initials, tintFor } from './avatar.tsx';

describe('Avatar', () => {
  it('derives initials and a stable tint', () => {
    expect(initials('Jun-seo Park')).toBe('JP');
    expect(initials('Mira')).toBe('M');
    expect(initials('  Ilse   Maria Brandt ')).toBe('IB');
    expect(tintFor('Mira Okafor')).toBe(tintFor('Mira Okafor'));
    expect(tintFor('Mira Okafor')).toBeGreaterThanOrEqual(1);
    expect(tintFor('Mira Okafor')).toBeLessThanOrEqual(6);
  });

  it('renders initials on its tint with presence as a word', () => {
    const { container } = render(<Root name="Aiko Sato" size={56} presence="away" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toBe('hj-avatar');
    expect(el.getAttribute('data-size')).toBe('56');
    expect(el.getAttribute('data-tint')).toBe(String(tintFor('Aiko Sato')));
    expect(screen.getByText('AS')).toBeTruthy();
    expect(screen.getByText('Away')).toBeTruthy();
  });

  it('group caps with +N and passes its size down', () => {
    render(
      <Group max={2} label="Listeners">
        <Root name="A One" />
        <Root name="B Two" />
        <Root name="C Three" />
        <Root name="D Four" />
      </Group>,
    );
    const group = screen.getByRole('group', { name: 'Listeners' });
    expect(group.querySelectorAll('.hj-avatar')).toHaveLength(2);
    expect(screen.getByLabelText('2 more').textContent).toBe('+2');
    expect(group.querySelector('.hj-avatar')?.getAttribute('data-size')).toBe('32');
  });
});
