import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { InputOwnProps, RootOwnProps, StrengthOwnProps } from './password-field.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'PasswordField',
  slug: 'password-field',
  category: 'controls',
  status: 'new',
  description:
    'A Field for passwords: a reveal toggle and an optional strength line that says what to do.',
  whenToUse: ['Sign-in, sign-up and change-password forms.'],
  whenNotToUse: [
    'One-time codes — use OTPField.',
    'Secrets the user must not see again (API keys) — show once with a copy button instead.',
  ],
  import: "import { PasswordField, estimateStrength } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Field.Root',
      slot: 'PasswordField.Root',
      className: 'hj-password-field',
      description:
        'A Field.Root that owns the reveal state and the typed value. Takes every Field.Root prop (validationMode, invalid, disabled, name).',
      props: props<RootOwnProps>({
        defaultVisible: { type: 'boolean', default: 'false', description: 'Start revealed.' },
      }),
    },
    {
      name: 'Label',
      element: 'label',
      base: 'Field.Label',
      slot: 'Field.Label',
      className: 'hj-field-label',
      description: 'Field.Label.',
    },
    {
      name: 'Input',
      element: 'input',
      base: 'Field.Control',
      slot: 'PasswordField.Input',
      className: 'hj-password-field-input',
      description: 'Field.Shell with a lock, the input (type password/text) and the reveal button.',
      props: props<InputOwnProps>({
        revealable: {
          type: 'boolean',
          default: 'true',
          description:
            'Show the eye toggle (aria-pressed, labelled from strings.showPassword / hidePassword).',
        },
        icon: {
          type: 'boolean | ReactNode',
          default: 'true',
          description: 'Leading glyph: a lock, your own node, or none.',
        },
      }),
      dataAttributes: { 'data-visible': 'Present while revealed.' },
    },
    {
      name: 'Strength',
      element: 'div',
      slot: 'PasswordField.Strength',
      className: 'hj-password-field-strength',
      description: 'Four segments and a word (“Strong · 19 characters”), announced politely.',
      props: props<StrengthOwnProps>({
        estimate: {
          type: '(value: string) => { score: 0–4; label: string }',
          description: 'Replace the default estimate (e.g. zxcvbn or a server check).',
        },
        minLength: {
          type: 'number',
          default: '8',
          description: 'Minimum length for the default estimate.',
        },
      }),
      dataAttributes: { 'data-score': '0–4', 'data-tone': 'danger | warning | success' },
    },
    {
      name: 'Description',
      element: 'p',
      base: 'Field.Description',
      slot: 'Field.Description',
      className: 'hj-field-description',
      description: 'Requirements go here, not in the placeholder.',
    },
    {
      name: 'Error',
      element: 'div',
      base: 'Field.Error',
      slot: 'Field.Error',
      className: 'hj-field-error',
      description: 'Validation message with its glyph.',
    },
  ],
  examples: [
    {
      file: 'create',
      title: 'Create a password',
      description: 'Strength builds as you type; errors on blur say what to do.',
    },
    {
      file: 'sign-in',
      title: 'Sign in, errors and locked',
      description: 'A wrong password with tries left, and a managed field without reveal.',
    },
  ],
  accessibility: [
    'The reveal button is a toggle (aria-pressed) with a label that names the action.',
    'Strength is announced politely; it is a hint, never the validation itself.',
    'autoComplete defaults to current-password; use new-password on sign-up so managers offer to generate one.',
  ],
  motion:
    'Strength segments fill by scaleX on snappy, clamped, 24 ms apart; the eye glyph cross-fades. No travel.',
  tokens: ['danger', 'warning', 'success', 'fg-mute', 'stagger', 'ease-snappy-settle'],
  related: ['field', 'otp-field', 'form'],
  baseUi: 'field',
});
