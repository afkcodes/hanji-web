import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './otp-field.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'OTPField',
  slug: 'otp-field',
  category: 'controls',
  status: 'new',
  description: 'A one-time code entered one character per cell, pasted or typed.',
  whenToUse: ['Verification and sign-in codes, device pairing codes.'],
  whenNotToUse: [
    'Passwords or PINs the user chose — use PasswordField.',
    'Long identifiers (card numbers, IBANs) — use Field with formatting.',
  ],
  import: "import { OTPField } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'OTPField.Root',
      slot: 'OTPField.Root',
      className: 'hj-otp-field',
      description:
        'Owns the code: length (required), value, onValueChange, onValueComplete, validationType, mask, autoSubmit. Childless, it renders and labels `length` cells.',
      props: props<RootOwnProps>({
        status: {
          type: "'idle' | 'error' | 'success'",
          default: "'idle'",
          description: 'error = danger ring + one nudge; success = success tint.',
        },
        size: { type: "'sm' | 'md'", default: "'md'", description: 'Cells 40×48 or 48×56.' },
      }),
      dataAttributes: {
        'data-status': 'error | success',
        'data-pasting': 'For 600 ms after a paste (drives the cascade).',
        'data-complete': 'All cells filled (Base UI).',
        'data-focused': 'A cell has focus (Base UI).',
      },
      cssVars: {
        '--hj-otp-field-cell-width': 'Cell width.',
        '--hj-otp-field-cell-height': 'Cell height.',
        '--hj-otp-field-gap': 'Gap between cells. Default 8px.',
      },
    },
    {
      name: 'Input',
      element: 'input',
      base: 'OTPField.Input',
      slot: 'OTPField.Input',
      className: 'hj-otp-field-input',
      description:
        'One cell. Label cells 2..n “Character n of N”; the first takes the field label.',
      dataAttributes: {
        'data-filled': 'Has a character.',
        'data-invalid': 'Invalid (in Field).',
        'data-disabled': 'Disabled.',
      },
    },
    {
      name: 'Separator',
      element: 'div',
      base: 'Separator',
      slot: 'OTPField.Separator',
      className: 'hj-otp-field-separator',
      description: 'A short dash between groups.',
    },
  ],
  examples: [
    {
      file: 'verify',
      title: 'Verify a code',
      description:
        'Type or paste; the right code tints success, a wrong one nudges once and says what to check.',
    },
    {
      file: 'grouped',
      title: 'Grouped and locked',
      description: 'An alphanumeric 3–3 pairing code, and a field locked after too many tries.',
    },
  ],
  accessibility: [
    'Each cell is an input; the first uses the field label, the rest “Character n of N”.',
    'autocomplete="one-time-code" lets the OS offer codes from messages.',
    'Status must also be said in words beside the field — the tint alone is not enough.',
  ],
  motion:
    'A filled cell settles in from scale .92 on snappy, clamped. A paste fills left to right on the 24 ms clock. A wrong code nudges once (4px, 380 ms) — under reduced motion it only changes colour.',
  tokens: [
    'surface',
    'surface-2',
    'line',
    'accent',
    'danger',
    'success',
    'success-soft',
    'stagger',
    'ease-snappy-settle',
  ],
  related: ['field', 'password-field'],
  baseUi: 'otp-field',
});
