import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as Field from '../field/field.tsx';
import * as Fieldset from './fieldset.tsx';

describe('Fieldset', () => {
  it('names the group and disables its fields', () => {
    render(
      <Fieldset.Root disabled>
        <Fieldset.Legend variant="eyebrow">Downloads</Fieldset.Legend>
        <Fieldset.Description>Managed by your organisation.</Fieldset.Description>
        <Field.Root>
          <Field.Label>Folder</Field.Label>
          <Field.Control />
        </Field.Root>
      </Fieldset.Root>,
    );
    const group = screen.getByRole('group', { name: 'Downloads' });
    expect(group.className).toContain('hj-fieldset');
    expect(group.hasAttribute('data-disabled')).toBe(true);
    expect(screen.getByText('Downloads').getAttribute('data-variant')).toBe('eyebrow');
    expect((screen.getByLabelText('Folder') as HTMLInputElement).disabled).toBe(true);
  });
});
