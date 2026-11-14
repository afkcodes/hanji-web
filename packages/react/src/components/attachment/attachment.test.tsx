import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as Attachment from './attachment.tsx';

describe('Attachment', () => {
  it('names the group and the remove button after the file', async () => {
    const onRemove = vi.fn<() => void>();
    render(
      <Attachment.Root name="liner-notes.pdf">
        <Attachment.Icon />
        <Attachment.Name />
        <Attachment.Meta>{Attachment.formatBytes(884_120)}</Attachment.Meta>
        <Attachment.Remove onClick={onRemove} />
      </Attachment.Root>,
    );
    const group = screen.getByRole('group', { name: 'liner-notes.pdf' });
    expect(group.dataset.kind).toBe('pdf');
    expect(group.textContent).toContain('863 KB');
    await userEvent.click(screen.getByRole('button', { name: 'Remove liner-notes.pdf' }));
    expect(onRemove).toHaveBeenCalled();
  });

  it('uploading: busy, progress bar, indeterminate without a number', () => {
    const { container, rerender } = render(
      <Attachment.Root name="a.wav" status="uploading">
        <Attachment.Progress />
      </Attachment.Root>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(root.hasAttribute('data-indeterminate')).toBe(true);
    expect(container.querySelector('.hj-attachment-progress')).not.toBeNull();
    rerender(
      <Attachment.Root name="a.wav" status="ready">
        <Attachment.Progress />
      </Attachment.Root>,
    );
    expect(container.querySelector('.hj-attachment-progress')).toBeNull();
  });

  it('formats sizes and guesses kinds', () => {
    expect(Attachment.formatBytes(0)).toBe('0 B');
    expect(Attachment.formatBytes(1536)).toBe('1.5 KB');
    expect(Attachment.formatBytes(41_204_221)).toBe('39 MB');
    expect(Attachment.kindOf('photo.HEIC')).toBe('image');
    expect(Attachment.kindOf('audio/mpeg')).toBe('audio');
    expect(Attachment.kindOf('notes')).toBe('file');
  });
});
