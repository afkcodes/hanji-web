import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ControlOwnProps, ErrorOwnProps, InputOwnProps, LabelOwnProps } from './field.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Field',
  slug: 'field',
  category: 'controls',
  status: 'stable',
  description:
    'A labelled text input with its help line and its error, wired for validation and screen readers.',
  whenToUse: [
    'Single-line text: names, emails, search terms, codes.',
    'Any control that needs a label, help text and an error (wrap Switch, Select, Slider… in Field.Root too).',
  ],
  whenNotToUse: [
    'Choosing from a short known list — use Select or RadioGroup.',
    'A single on/off — use Switch.',
  ],
  import: "import { Field, Input } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Field.Root',
      slot: 'Field.Root',
      className: 'hj-field',
      description:
        'Groups the parts; owns validation (validate, validationMode, invalid, disabled, name).',
      dataAttributes: {
        'data-invalid': 'Invalid.',
        'data-focused': 'Control focused.',
        'data-filled': 'Has a value.',
        'data-dirty': 'Changed.',
        'data-disabled': 'Disabled.',
      },
    },
    {
      name: 'Label',
      element: 'label',
      base: 'Field.Label',
      slot: 'Field.Label',
      className: 'hj-field-label',
      description: '13/600 above the control.',
      props: props<LabelOwnProps>({
        optional: {
          type: 'boolean',
          default: 'false',
          description: 'Append the localised “Optional”.',
        },
      }),
    },
    {
      name: 'Control',
      element: 'input',
      base: 'Field.Control',
      slot: 'Field.Control',
      className: 'hj-field-control',
      description: 'The input. Alone it draws the 48px box; inside Shell it draws only text.',
      props: props<ControlOwnProps>({
        size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Heights 40 / 48 / 56.' },
      }),
      cssVars: {
        '--hj-field-height': 'Box height.',
        '--hj-field-radius': 'Corner radius. Default radius-sm.',
        '--hj-field-bg': 'Fill. Default surface.',
      },
    },
    {
      name: 'Shell',
      element: 'div',
      slot: 'Field.Shell',
      className: 'hj-field-shell',
      description: 'The box when the control has adornments; focus and error rings move here.',
    },
    {
      name: 'Adornment',
      element: 'span',
      slot: 'Field.Adornment',
      className: 'hj-field-adornment',
      description: 'Leading or trailing icon, button, unit or hint inside Shell.',
    },
    {
      name: 'Description',
      element: 'p',
      base: 'Field.Description',
      slot: 'Field.Description',
      className: 'hj-field-description',
      description: 'Help line, 12.5 muted. Linked by aria-describedby.',
    },
    {
      name: 'Error',
      element: 'div',
      base: 'Field.Error',
      slot: 'Field.Error',
      className: 'hj-field-error',
      description:
        'Shown when invalid (use match="valueMissing" etc. per message). Says what to do next.',
      props: props<ErrorOwnProps>({
        icon: {
          type: 'boolean',
          default: 'true',
          description:
            'Lead with the alert glyph (drawn in CSS, swappable via --hj-field-error-icon) — never colour alone. Omit children to show Base UI’s own validation message.',
        },
      }),
    },
    {
      name: 'Validity',
      element: '(render fn)',
      base: 'Field.Validity',
      slot: 'Field.Validity',
      className: '',
      description: 'Render-prop access to the ValidityState.',
    },
    {
      name: 'Item',
      element: 'div',
      base: 'Field.Item',
      slot: 'Field.Item',
      className: 'hj-field-item',
      description: 'One option in a checkbox or radio group field.',
    },
    {
      name: 'Input',
      element: 'input',
      base: 'Input',
      slot: 'Input',
      className: 'hj-field-control',
      description: 'Standalone input, outside a Field.',
      props: props<InputOwnProps>({
        size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Heights 40 / 48 / 56.' },
      }),
    },
  ],
  examples: [
    {
      file: 'basic',
      title: 'Label, help and error',
      description: 'An email field validated on blur.',
    },
    {
      file: 'adornments',
      title: 'Adornments',
      description: 'A search field with an icon and a clear button.',
    },
  ],
  accessibility: [
    'Label, description and error are linked to the control automatically.',
    'Errors lead with a glyph and a sentence; colour is never the only signal.',
    'Validation runs on submit by default, or on blur/change via validationMode.',
  ],
  motion: 'Focus and error are colour on a 180 ms ease-out — no travel. Errors fade in.',
  tokens: ['surface', 'line', 'accent', 'danger', 'fg-mute', 'radius-sm'],
  related: ['form', 'select', 'number-field', 'otp-field', 'password-field', 'search-field'],
  baseUi: 'field',
});
