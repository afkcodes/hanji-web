'use client';
import { Form as BaseForm } from '@base-ui/react/form';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** The submit row: primary action last, aligned to the reading edge. */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Form.Actions',
  'hj-form-actions',
);

export interface RootOwnProps {
  /** stack = one column (default) · grid = fields flow into columns of at least 240px. */
  layout?: 'stack' | 'grid';
}
// oxlint-disable-next-line typescript/no-explicit-any -- mirrors Base UI's own FormValues bound
export type FormValues = Record<string, any>;
export interface RootProps<V extends FormValues = FormValues>
  extends RootOwnProps, BaseForm.Props<V> {}

/**
 * A form that validates its Fields together and takes server errors by field name
 * (`errors={{ email: 'Already registered' }}`), shown by each Field.Error.
 */
export function Root<V extends FormValues = FormValues>(props: RootProps<V>): React.ReactElement {
  const config = useHanjiConfig();
  const { layout = 'stack', className, ...rest } = withDefaults(config, 'Form.Root', props);
  return (
    <BaseForm<V>
      {...rest}
      data-layout={layout}
      className={cls(config, 'Form.Root', 'hj-form', className)}
    />
  );
}

export interface ErrorSummaryOwnProps {
  /** Errors by field name — the same object you pass to Root's `errors`. Renders nothing when empty. */
  errors?: Readonly<Record<string, string | readonly string[] | undefined>>;
  /** Heading. @default 'There’s a problem' */
  title?: React.ReactNode;
  /** Move focus to the summary when errors arrive, so keyboard and screen-reader users land on it. @default true */
  autoFocus?: boolean;
}
export interface ErrorSummaryProps
  extends ErrorSummaryOwnProps, Omit<React.ComponentProps<'div'>, 'title' | 'children'> {}

/**
 * After a failed submit: one place that lists every problem as a link to its field. The fields
 * still show their own messages.
 */
export function ErrorSummary(props: ErrorSummaryProps): React.ReactElement | null {
  const config = useHanjiConfig();
  const {
    errors,
    title = 'There’s a problem',
    autoFocus = true,
    className,
    ...rest
  } = withDefaults(config, 'Form.ErrorSummary', props);
  const ref = React.useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors ?? {}).flatMap(([name, v]) =>
    v === undefined ? [] : (typeof v === 'string' ? [v] : v).map((message) => ({ name, message })),
  );
  const key = entries.map((e) => `${e.name}:${e.message}`).join('|');
  React.useEffect(() => {
    if (autoFocus && key) ref.current?.focus();
  }, [autoFocus, key]);
  if (entries.length === 0) return null;
  const styled = !config.unstyled;
  const focusField = (name: string): void => {
    const form = ref.current?.closest('form') ?? document;
    const el = form.querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`);
    el?.focus();
  };
  return (
    <div
      {...rest}
      ref={ref}
      role="alert"
      tabIndex={-1}
      className={cls(config, 'Form.ErrorSummary', 'hj-form-error-summary', className) as string}
    >
      <p className={styled ? 'hj-form-error-summary-title' : undefined}>
        {config.icons.alert}
        {title}
      </p>
      <ul className={styled ? 'hj-form-error-summary-list' : undefined}>
        {entries.map((e) => (
          <li key={`${e.name}:${e.message}`}>
            <a
              href={`#${e.name}`}
              onClick={(ev) => {
                ev.preventDefault();
                focusField(e.name);
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
