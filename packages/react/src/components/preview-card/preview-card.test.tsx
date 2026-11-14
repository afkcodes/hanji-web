import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as PreviewCard from './preview-card.tsx';

describe('PreviewCard', () => {
  it('renders a real link and shows the card on focus', async () => {
    render(
      <PreviewCard.Root>
        <PreviewCard.Trigger href="#a">Kōya Lanes</PreviewCard.Trigger>
        <PreviewCard.Content>
          <PreviewCard.Body>
            <PreviewCard.Title>Kōya Lanes</PreviewCard.Title>
          </PreviewCard.Body>
        </PreviewCard.Content>
      </PreviewCard.Root>,
    );
    const link = screen.getByRole('link', { name: 'Kōya Lanes' });
    expect(link.getAttribute('href')).toBe('#a');
    expect(link.className).toBe('hj-preview-card-trigger');
  });

  it('defaultOpen shows the card with hanji parts', async () => {
    render(
      <PreviewCard.Root defaultOpen>
        <PreviewCard.Trigger href="#a">Kōya</PreviewCard.Trigger>
        <PreviewCard.Content arrow>
          <PreviewCard.Body>
            <PreviewCard.Title>Profile</PreviewCard.Title>
          </PreviewCard.Body>
        </PreviewCard.Content>
      </PreviewCard.Root>,
    );
    await act(async () => {});
    const title = await screen.findByText('Profile');
    const popup = title.closest('.hj-preview-card-popup');
    expect(popup).not.toBeNull();
    expect(popup?.querySelector('.hj-preview-card-arrow')).not.toBeNull();
    expect(title.className).toBe('hj-preview-card-title');
  });
});
