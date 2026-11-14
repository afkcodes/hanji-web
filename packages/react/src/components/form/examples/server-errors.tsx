import { Button, Field, Form } from '@hanji/react';
import * as React from 'react';

type Errors = Record<string, string>;

/** Pretend server: the handle is taken and the email domain is blocked. */
async function register(values: Record<string, unknown>): Promise<Errors> {
  await new Promise((r) => setTimeout(r, 700));
  const errors: Errors = {};
  if (String(values.handle ?? '').toLowerCase() === 'mira') {
    errors.handle = '@mira is taken. Try @mira.okafor or add a number.';
  }
  if (String(values.email ?? '').endsWith('@example.com')) {
    errors.email = 'We can’t send to example.com addresses. Use an inbox you can open.';
  }
  return errors;
}

export function Example(): React.JSX.Element {
  const [errors, setErrors] = React.useState<Errors>({});
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  return (
    <Form.Root
      style={{ width: 400 }}
      errors={errors}
      onFormSubmit={async (values) => {
        setPending(true);
        setDone(false);
        const next = await register(values);
        setErrors(next);
        setPending(false);
        setDone(Object.keys(next).length === 0);
      }}
    >
      <Form.ErrorSummary errors={errors} />
      <Field.Root name="handle">
        <Field.Label>Handle</Field.Label>
        <Field.Control defaultValue="mira" required />
        <Field.Error match={!!errors.handle}>{errors.handle}</Field.Error>
        <Field.Error match="valueMissing">Choose a handle.</Field.Error>
        <Field.Description>Shown on your profile and playlists.</Field.Description>
      </Field.Root>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" defaultValue="mira@example.com" required />
        <Field.Error match={!!errors.email}>{errors.email}</Field.Error>
        <Field.Error match="typeMismatch">Enter an email address like name@example.com</Field.Error>
      </Field.Root>
      <Form.Actions>
        <Button type="submit" loading={pending}>
          Create account
        </Button>
        {done ? (
          <span style={{ fontSize: 13, color: 'var(--hj-success)' }}>Account created.</span>
        ) : null}
      </Form.Actions>
    </Form.Root>
  );
}
