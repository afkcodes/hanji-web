import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  AttachOwnProps,
  CountOwnProps,
  ErrorOwnProps,
  RootOwnProps,
  SubmitOwnProps,
  TextareaOwnProps,
} from './prompt-input.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'PromptInput',
  slug: 'prompt-input',
  category: 'ai',
  status: 'new',
  description:
    'The box a person types a prompt into: grows with the text, sends on Enter, becomes Stop while a reply streams.',
  whenToUse: [
    'The composer under a conversation with an assistant.',
    'Any single free-text request to a model (search-like asks, rewrite this).',
  ],
  whenNotToUse: [
    'Structured input with known fields — use Field and Form.',
    'Short single-line search — use Field with a search Control.',
  ],
  import: "import { PromptInput } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'form',
      slot: 'PromptInput.Root',
      className: 'hj-prompt-input',
      description:
        'Owns the text, status and submit/stop. Ring turns accent on focus and danger on error.',
      props: props<RootOwnProps>({
        value: { type: 'string', description: 'Controlled text.' },
        defaultValue: { type: 'string', default: "''", description: 'Uncontrolled initial text.' },
        onValueChange: { type: '(value: string) => void', description: 'Text changed.' },
        onSubmit: {
          type: '(value: string, event) => void',
          description: 'Trimmed prompt. Never called while busy or when empty.',
        },
        onStop: {
          type: '() => void',
          description: 'Stop pressed while streaming — abort your request here.',
        },
        status: {
          type: "'idle' | 'submitting' | 'streaming' | 'error'",
          default: "'idle'",
          description: 'streaming turns Submit into Stop; error shows Error and a danger ring.',
        },
        disabled: { type: 'boolean', default: 'false', description: 'Locks the whole composer.' },
        clearOnSubmit: {
          type: 'boolean',
          default: 'true',
          description: 'Empty the text after a send (uncontrolled).',
        },
      }),
      dataAttributes: {
        'data-status': 'idle | submitting | streaming | error',
        'data-disabled': 'Disabled.',
      },
      cssVars: {
        '--hj-prompt-input-radius': 'Corner radius. Default radius-xl.',
        '--hj-prompt-input-bg': 'Fill. Default surface-2.',
        '--hj-prompt-input-max-height': 'Textarea height before it scrolls. Default 240px.',
      },
    },
    {
      name: 'Textarea',
      element: 'textarea',
      slot: 'PromptInput.Textarea',
      className: 'hj-prompt-input-textarea',
      description:
        'Grows with its content (field-sizing: content) up to the max height. Enter sends, Shift+Enter is a newline; IME composition never sends.',
      props: props<TextareaOwnProps>({
        submitOnEnter: {
          type: 'boolean',
          default: 'true',
          description: 'Enter sends; off: Enter adds a line.',
        },
      }),
    },
    {
      name: 'Toolbar',
      element: 'div',
      slot: 'PromptInput.Toolbar',
      className: 'hj-prompt-input-toolbar',
      description: 'Row under the text: Attach, ModelPicker, Hint, Count, Submit (pushed right).',
    },
    {
      name: 'Hint',
      element: 'span',
      slot: 'PromptInput.Hint',
      className: 'hj-prompt-input-hint',
      description: 'Quiet mono hint: a shortcut, a limit, the model in use.',
    },
    {
      name: 'Count',
      element: 'span',
      slot: 'PromptInput.Count',
      className: 'hj-prompt-input-count',
      description: 'Character count of the prompt; danger and data-over past max.',
      props: props<CountOwnProps>({ max: { type: 'number', description: 'Show length / max.' } }),
      dataAttributes: { 'data-over': 'Longer than max.' },
    },
    {
      name: 'Attach',
      element: 'button',
      base: 'Button',
      slot: 'PromptInput.Attach',
      className: 'hj-prompt-input-attach',
      description: 'Paperclip button that opens the file picker.',
      props: props<AttachOwnProps>({
        onFiles: { type: '(files: File[]) => void', description: 'The chosen files.' },
        accept: { type: 'string', description: 'File types, e.g. image/*,.pdf.' },
        multiple: { type: 'boolean', default: 'true', description: 'Allow several files.' },
        label: { type: 'string', default: "'Attach files'", description: 'Accessible label.' },
      }),
    },
    {
      name: 'Submit',
      element: 'button',
      base: 'Button',
      slot: 'PromptInput.Submit',
      className: 'hj-prompt-input-submit',
      description:
        'Send (arrow). Disabled while empty. Becomes Stop (square, ink) while streaming.',
      props: props<SubmitOwnProps>({
        label: { type: 'string', default: 'strings.send', description: 'Label while idle.' },
        stopLabel: {
          type: 'string',
          default: 'strings.stop',
          description: 'Label while streaming.',
        },
      }),
      dataAttributes: {
        'data-mode': 'send | stop',
        'data-pending': 'Status is submitting.',
        'data-disabled': 'Nothing to send.',
      },
    },
    {
      name: 'Error',
      element: 'div',
      slot: 'PromptInput.Error',
      className: 'hj-prompt-input-error',
      description:
        'role="alert" line shown while status is error. Say what happened and what to do.',
      props: props<ErrorOwnProps>({
        forceShow: { type: 'boolean', default: 'false', description: 'Show regardless of status.' },
      }),
    },
  ],
  examples: [
    {
      file: 'composer',
      title: 'Composer',
      description: 'Send, stream, stop — with attach, a hint and a count.',
    },
    {
      file: 'error',
      title: 'Failed send',
      description: 'The send failed; the text is kept and the error says what to do.',
    },
  ],
  accessibility: [
    'A real <form>: Enter submits through requestSubmit, so form validation and onSubmit run as usual.',
    'Submit stays focusable while disabled and swaps its label between Send and Stop generating.',
    'aria-busy on the form while submitting or streaming; Error is role="alert".',
    'Label the textarea: with a visible label, aria-label, or a placeholder that says what to ask.',
  ],
  motion:
    'Focus is colour only. Send and Stop cross-fade and scale on the snappy spring; the arrow lifts 3px while sending. Press dips .97.',
  tokens: [
    'surface-2',
    'line',
    'accent',
    'on-accent',
    'fg',
    'danger',
    'radius-xl',
    'ease-snappy-settle',
  ],
  related: ['conversation', 'message', 'attachment', 'model-picker', 'suggestions'],
});
