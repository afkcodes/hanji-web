'use client';
import type { Field as BaseField } from '@base-ui/react/field';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import * as Field from '../field/field.tsx';

interface PasswordContextValue {
  visible: boolean;
  setVisible: (v: boolean) => void;
  value: string;
  setValue: (v: string) => void;
}
const PasswordContext = React.createContext<PasswordContextValue | null>(null);

function usePassword(part: string): PasswordContextValue {
  const ctx = React.useContext(PasswordContext);
  // `Error` is a part here, so reach the global constructor explicitly.
  if (!ctx)
    throw new globalThis.Error(`<PasswordField.${part}> must be inside <PasswordField.Root>.`);
  return ctx;
}

/** The label, from Field. */
export const Label: typeof Field.Label = Field.Label;
/** Help text, from Field. Put requirements here, not in the placeholder. */
export const Description: typeof Field.Description = Field.Description;
/** Validation message, from Field. Say what to do: “Use at least 12 characters.” */
export const Error: typeof Field.Error = Field.Error;

export interface RootOwnProps {
  /** Start with the password shown (e.g. on a device the user owns). @default false */
  defaultVisible?: boolean;
}
export interface RootProps extends RootOwnProps, BaseField.Root.Props {}

/** A Field for a password: owns the reveal state and the typed value for Strength. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    defaultVisible = false,
    className,
    ...rest
  } = withDefaults(config, 'PasswordField.Root', props);
  const [visible, setVisible] = React.useState(defaultVisible);
  const [value, setValue] = React.useState('');
  const ctx = React.useMemo(() => ({ visible, setVisible, value, setValue }), [visible, value]);
  return (
    <PasswordContext.Provider value={ctx}>
      <Field.Root
        {...rest}
        className={cls(config, 'PasswordField.Root', 'hj-password-field', className)}
      />
    </PasswordContext.Provider>
  );
}

const LOCK = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1ZM8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export interface InputOwnProps {
  /** Show the reveal (eye) button. @default true */
  revealable?: boolean;
  /** Leading glyph. `true` = a lock; a node = your own; false = none. @default true */
  icon?: boolean | React.ReactNode;
}
export interface InputProps extends InputOwnProps, Omit<Field.ControlProps, 'type'> {}

/** The password box: lock, input, reveal. Tracks the value for Strength. */
export function Input(props: InputProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    revealable = true,
    icon = true,
    onChange,
    className,
    ...rest
  } = withDefaults(config, 'PasswordField.Input', props);
  const { visible, setVisible, setValue } = usePassword('Input');
  const styled = !config.unstyled;
  return (
    <Field.Shell className={styled ? 'hj-password-field-shell' : undefined}>
      {icon ? <Field.Adornment>{icon === true ? LOCK : icon}</Field.Adornment> : null}
      <Field.Control
        autoComplete="current-password"
        spellCheck={false}
        {...rest}
        type={visible ? 'text' : 'password'}
        data-visible={flag(visible)}
        className={cls(config, 'PasswordField.Input', 'hj-password-field-input', className)}
        onChange={(e) => {
          setValue(e.currentTarget.value);
          onChange?.(e);
        }}
      />
      {revealable ? (
        <Field.Adornment>
          <button
            type="button"
            className={styled ? 'hj-password-field-reveal' : undefined}
            aria-pressed={visible}
            aria-label={visible ? config.strings.hidePassword : config.strings.showPassword}
            onClick={() => setVisible(!visible)}
          >
            {visible ? config.icons.eyeOff : config.icons.eye}
          </button>
        </Field.Adornment>
      ) : null}
    </Field.Shell>
  );
}

/** A strength estimate: 0 (empty) to 4, with the word to show. */
export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

/** hanji's default estimate: length first, then variety. Replace it with zxcvbn or a server check. */
export function estimateStrength(value: string, minLength = 8): StrengthResult {
  if (!value) return { score: 0, label: `Use ${minLength} or more characters` };
  if (value.length < minLength) return { score: 1, label: 'Too short' };
  let s = 1;
  if (value.length >= 12) s++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) s++;
  if (/\d/.test(value) || /[^a-zA-Z\d]/.test(value)) s++;
  if (value.length >= 16) s++;
  const score = Math.min(4, s) as StrengthResult['score'];
  return { score, label: ['', 'Weak', 'Fair', 'Good', 'Strong'][score] ?? 'Strong' };
}

export interface StrengthOwnProps {
  /** Your own estimate (e.g. zxcvbn). Receives the current value. */
  estimate?: (value: string) => StrengthResult;
  /** Minimum length used by the default estimate. @default 8 */
  minLength?: number;
}
export interface StrengthProps
  extends StrengthOwnProps, Omit<React.ComponentProps<'div'>, 'children'> {}

/** Four segments and a word — “Strong · 19 characters”. Announced politely. */
export function Strength(props: StrengthProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    estimate,
    minLength = 8,
    className,
    ...rest
  } = withDefaults(config, 'PasswordField.Strength', props);
  const { value } = usePassword('Strength');
  const r = estimate ? estimate(value) : estimateStrength(value, minLength);
  const tone = r.score <= 1 ? 'danger' : r.score === 2 ? 'warning' : 'success';
  const styled = !config.unstyled;
  return (
    <div
      {...rest}
      data-score={r.score}
      data-tone={value ? tone : undefined}
      className={
        cls(config, 'PasswordField.Strength', 'hj-password-field-strength', className) as string
      }
    >
      <span className={styled ? 'hj-password-field-meter' : undefined} aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} data-on={flag(r.score >= n)} />
        ))}
      </span>
      <span className={styled ? 'hj-password-field-word' : undefined} aria-live="polite">
        {r.label}
        {value && r.score > 1 ? (
          <span className={styled ? 'hj-password-field-count' : undefined}>
            {' '}
            · {value.length} characters
          </span>
        ) : null}
      </span>
    </div>
  );
}
