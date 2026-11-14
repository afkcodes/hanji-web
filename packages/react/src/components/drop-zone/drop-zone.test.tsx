import { Field as BaseField } from '@base-ui/react/field';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as DropZone from './drop-zone.tsx';
import type { DropZoneChangeDetails, DropZoneRejection } from './drop-zone.tsx';

const MB = 1024 * 1024;

function pdf(name: string, bytes = 8): File {
  return new File(['x'.repeat(bytes)], name, { type: 'application/pdf' });
}

/** A DataTransfer-like object, as a drag from the desktop carries it. */
function transfer(files: File[]): object {
  return {
    types: ['Files'],
    items: files.map((f) => ({ kind: 'file', type: f.type })),
    files,
    dropEffect: 'none',
  };
}

type OnChange = (files: File[], details: DropZoneChangeDetails) => void;
type OnReject = (rejections: DropZoneRejection[]) => void;

describe('DropZone', () => {
  it('renders a zone with a labelled Browse button and its hint', () => {
    render(
      <BaseField.Root>
        <BaseField.Label>Supporting documents</BaseField.Label>
        <DropZone.Root accept="application/pdf" multiple>
          <DropZone.Area>
            <DropZone.Icon />
            <DropZone.Content>
              <DropZone.Prompt />
              <DropZone.Hint>PDF only · up to 10 MB each</DropZone.Hint>
            </DropZone.Content>
            <DropZone.Trigger />
          </DropZone.Area>
        </DropZone.Root>
      </BaseField.Root>,
    );
    // label + own text (browsers resolve the self-reference; happy-dom's name maths doesn't)
    const button = screen.getByRole('button', { name: 'Supporting documents' });
    const label = screen.getByText('Supporting documents');
    expect(label.getAttribute('for')).toBe(button.id);
    expect(button.getAttribute('aria-labelledby')).toBe(`${label.id} ${button.id}`);
    expect(button.textContent).toBe('Browse');
    expect(button.getAttribute('aria-describedby')).toContain(
      screen.getByText('PDF only · up to 10 MB each').id,
    );
    expect(screen.getByText('Drop files here')).toBeTruthy();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('application/pdf');
    expect(input.multiple).toBe(true);
    expect(input.tabIndex).toBe(-1);
  });

  it('opens the picker from the button and from a click on the zone', async () => {
    render(<DropZone.Root />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    await userEvent.click(screen.getByRole('button', { name: 'Browse' }));
    expect(click).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByText('Drop a file here'));
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('opens the picker with Enter and Space on the button', async () => {
    render(<DropZone.Root />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    const button = screen.getByRole('button', { name: 'Browse' });
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('accepts dropped files and rejects the rest with reasons', () => {
    const onFilesChange = vi.fn<OnChange>();
    const onReject = vi.fn<OnReject>();
    render(
      <DropZone.Root
        accept="application/pdf"
        multiple
        maxSize={10 * MB}
        maxFiles={2}
        onFilesChange={onFilesChange}
        onReject={onReject}
      />,
    );
    const area = document.querySelector('.hj-drop-zone-area') as HTMLElement;
    const lease = pdf('lease.pdf');
    const big = new File(['x'], 'scan.pdf', { type: 'application/pdf' });
    Object.defineProperty(big, 'size', { value: 14 * MB });
    const sheet = new File(['x'], 'budget.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const payslip = pdf('payslip.pdf');
    const extra = pdf('extra.pdf');
    fireEvent.drop(area, { dataTransfer: transfer([lease, big, sheet, payslip, extra]) });
    expect(onFilesChange).toHaveBeenCalledWith([lease, payslip], {
      reason: 'drop',
      added: [lease, payslip],
      removed: [],
    });
    const rejections = onReject.mock.calls[0]?.[0] ?? [];
    expect(rejections.map((r) => [r.file.name, r.reason, r.message])).toEqual([
      ['scan.pdf', 'size', 'Over 10 MB'],
      ['budget.xlsx', 'type', 'File type not accepted'],
      ['extra.pdf', 'count', 'Over the 2-file limit'],
    ]);
    expect(document.querySelector('[data-drop-zone-live]')?.textContent).toBe(
      '2 files added. scan.pdf: Over 10 MB. budget.xlsx: File type not accepted. extra.pdf: Over the 2-file limit',
    );
    // childless Root lists what it holds
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringContaining('lease.pdf'),
      expect.stringContaining('payslip.pdf'),
    ]);
  });

  it('shows drag-over, and refuses a drag it can tell is the wrong type', () => {
    render(<DropZone.Root accept="image/png,image/jpeg" />);
    const area = document.querySelector('.hj-drop-zone-area') as HTMLElement;
    const photo = new File(['x'], 'aiko.png', { type: 'image/png' });
    fireEvent.dragEnter(area, { dataTransfer: transfer([photo]) });
    expect(area.hasAttribute('data-dragging')).toBe(true);
    expect(area.hasAttribute('data-reject')).toBe(false);
    fireEvent.dragLeave(area, { dataTransfer: transfer([photo]) });
    expect(area.hasAttribute('data-dragging')).toBe(false);

    fireEvent.dragEnter(area, { dataTransfer: transfer([pdf('cv.pdf')]) });
    expect(area.hasAttribute('data-reject')).toBe(true);
    expect(screen.getByText('File type not accepted').className).toContain('hj-drop-zone-prompt');
    // refusal is glyph + words, not colour alone: the upload arrow gives way to the alert
    expect(area.querySelector('.hj-drop-zone-arrow')).toBeNull();
    fireEvent.dragLeave(area, { dataTransfer: transfer([pdf('cv.pdf')]) });
    expect(area.querySelector('.hj-drop-zone-arrow')).not.toBeNull();

    // two files onto a one-file zone
    fireEvent.dragEnter(area, { dataTransfer: transfer([photo, photo]) });
    expect(screen.getByText('Only one file allowed')).toBeTruthy();
  });

  it('a single-file zone replaces its file', () => {
    const onFilesChange = vi.fn<OnChange>();
    render(<DropZone.Root onFilesChange={onFilesChange} />);
    const area = document.querySelector('.hj-drop-zone-area') as HTMLElement;
    const first = pdf('first.pdf');
    const second = pdf('second.pdf');
    fireEvent.drop(area, { dataTransfer: transfer([first]) });
    fireEvent.drop(area, { dataTransfer: transfer([second]) });
    expect(onFilesChange).toHaveBeenLastCalledWith([second], {
      reason: 'drop',
      added: [second],
      removed: [first],
    });
  });

  it('takes pasted files while focus is inside', () => {
    const onFilesChange = vi.fn<OnChange>();
    render(<DropZone.Root multiple onFilesChange={onFilesChange} />);
    const button = screen.getByRole('button', { name: 'Browse' });
    const file = pdf('pasted.pdf');
    fireEvent.paste(button, { clipboardData: { files: [file] } });
    expect(onFilesChange).toHaveBeenCalledWith([file], {
      reason: 'paste',
      added: [file],
      removed: [],
    });
  });

  it('ignores everything when disabled', async () => {
    const onFilesChange = vi.fn<OnChange>();
    render(<DropZone.Root disabled onFilesChange={onFilesChange} />);
    const area = document.querySelector('.hj-drop-zone-area') as HTMLElement;
    expect(area.hasAttribute('data-disabled')).toBe(true);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    await userEvent.click(area);
    fireEvent.drop(area, { dataTransfer: transfer([pdf('a.pdf')]) });
    expect(click).not.toHaveBeenCalled();
    expect(onFilesChange).not.toHaveBeenCalled();
    expect((screen.getByRole('button', { name: 'Browse' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('takes disabled, invalid and name from a Field', () => {
    const { rerender } = render(
      <BaseField.Root name="proof" disabled>
        <DropZone.Root />
      </BaseField.Root>,
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.name).toBe('proof');
    expect(input.disabled).toBe(true);
    expect(document.querySelector('.hj-drop-zone-area')?.hasAttribute('data-disabled')).toBe(true);
    rerender(
      <BaseField.Root name="proof" invalid>
        <DropZone.Root />
      </BaseField.Root>,
    );
    expect(document.querySelector('.hj-drop-zone')?.hasAttribute('data-invalid')).toBe(true);
    expect(document.querySelector('.hj-drop-zone-area')?.hasAttribute('data-invalid')).toBe(true);
  });

  it('remove fades the row, moves focus on, and drops the file from the zone', async () => {
    const onFilesChange = vi.fn<OnChange>();
    const lease = pdf('lease.pdf');
    const payslip = pdf('payslip.pdf');
    render(
      <DropZone.Root multiple defaultFiles={[lease, payslip]} onFilesChange={onFilesChange} />,
    );
    const first = screen.getByRole('button', { name: 'Remove lease.pdf' });
    first.focus();
    await userEvent.click(first);
    expect(first.closest('li')?.hasAttribute('data-leaving')).toBe(true);
    await waitFor(() =>
      expect(onFilesChange).toHaveBeenCalledWith([payslip], {
        reason: 'remove',
        added: [],
        removed: [lease],
      }),
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove payslip.pdf' }));
    expect(screen.queryByText('lease.pdf')).toBeNull();
  });

  it('file rows: progress, done, error with retry', async () => {
    const onRetry = vi.fn<() => void>();
    render(
      <DropZone.List>
        <DropZone.File
          name="bank-statement-q3.pdf"
          size={2_518_004}
          status="uploading"
          progress={0.6}
        />
        <DropZone.File name="payslip.pdf" size={412_330} status="done" />
        <DropZone.File
          name="passport.pdf"
          size={1_204_771}
          status="error"
          error="Upload failed — connection lost"
          onRetry={onRetry}
        />
        <DropZone.File name="cover.png" size={88_000} src="data:image/png;base64,AA==" />
      </DropZone.List>,
    );
    const bar = screen.getByRole('progressbar', { name: 'bank-statement-q3.pdf' });
    expect(bar.getAttribute('aria-valuenow')).toBe('60');
    expect(screen.getByText('60% · 2.4 MB')).toBeTruthy();
    expect(bar.closest('li')?.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Uploaded')).toBeTruthy();
    expect(screen.getByText('Upload failed — connection lost')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Retry passport.pdf' }));
    expect(onRetry).toHaveBeenCalled();
    // no ✕ without onRemove or a held file
    expect(screen.queryByRole('button', { name: /^Remove/ })).toBeNull();
    const img = document.querySelector('img') as HTMLImageElement;
    expect(img.closest('li')?.dataset.kind).toBe('image');
  });

  it('controlled: follows the files prop', () => {
    const onFilesChange = vi.fn<OnChange>();
    const a = pdf('a.pdf');
    const { rerender } = render(
      <DropZone.Root multiple files={[a]} onFilesChange={onFilesChange} />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    const area = document.querySelector('.hj-drop-zone-area') as HTMLElement;
    const b = pdf('b.pdf');
    act(() => {
      fireEvent.drop(area, { dataTransfer: transfer([b]) });
    });
    expect(onFilesChange).toHaveBeenCalledWith([a, b], expect.objectContaining({ added: [b] }));
    // not updated by the parent: still one row
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    rerender(<DropZone.Root multiple files={[a, b]} onFilesChange={onFilesChange} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
