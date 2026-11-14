import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ErrorSummaryOwnProps, RootOwnProps } from './form.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Form',
  slug: 'form',
  category: 'controls',
  status: 'stable',
  description:
    'A form that validates its Fields together, takes server errors by field name, and sums them up after a failed submit.',
  whenToUse: [
    'Any group of Fields submitted together.',
    'Server-side validation: pass returned errors to `errors`; each Field.Error shows its own.',
  ],
  whenNotToUse: ['A single setting that applies immediately (Switch, Select) — no form needed.'],
  import: "import { Form } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'form',
      base: 'Form',
      slot: 'Form.Root',
      className: 'hj-form',
      description:
        'The form: validationMode, errors (by field name), onFormSubmit(values), actionsRef. Works with Server Actions.',
      props: props<RootOwnProps>({
        layout: {
          type: "'stack' | 'grid'",
          default: "'stack'",
          description:
            'grid flows fields into ≥240px columns; Fieldsets, summaries and Actions span the row.',
        },
      }),
      dataAttributes: { 'data-layout': 'stack | grid' },
      cssVars: {
        '--hj-form-gap': 'Gap between fields. Default space-5.',
        '--hj-form-column': 'Minimum grid column. Default 240px.',
      },
    },
    {
      name: 'ErrorSummary',
      element: 'div',
      slot: 'Form.ErrorSummary',
      className: 'hj-form-error-summary',
      description:
        'After a failed submit: every problem as a link that focuses its field. Takes focus when errors arrive.',
      props: props<ErrorSummaryOwnProps>({
        errors: {
          type: 'Record<string, string | string[]>',
          description:
            'Errors by field name — the same object passed to Root. Renders nothing when empty.',
        },
        title: { type: 'ReactNode', default: "'There’s a problem'", description: 'Heading.' },
        autoFocus: {
          type: 'boolean',
          default: 'true',
          description: 'Focus the summary when errors arrive.',
        },
      }),
    },
    {
      name: 'Actions',
      element: 'div',
      slot: 'Form.Actions',
      className: 'hj-form-actions',
      description: 'The submit row; primary action last.',
    },
  ],
  examples: [
    {
      file: 'server-errors',
      title: 'Server errors',
      description:
        'Submit; the server rejects the handle and the email domain. A summary lists both, each field explains.',
    },
    {
      file: 'grid',
      title: 'Grid layout',
      description: 'A billing address in two columns under a Fieldset legend.',
    },
  ],
  accessibility: [
    'The summary is role="alert" and takes focus, so the problem is announced and keyboard users start there.',
    'Each summary link focuses its field by name; each Field still says its own message.',
    'Validation runs on submit by default; set validationMode for onBlur/onChange.',
  ],
  motion:
    'The summary settles in from 6px above on gentle (a fade under reduced motion). Fields change colour, never position.',
  tokens: ['danger', 'danger-soft', 'space-5', 'radius-md', 'ease-gentle-settle'],
  related: ['field', 'fieldset', 'button'],
  baseUi: 'form',
});
