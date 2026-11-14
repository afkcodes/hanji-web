import { Field } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 360 }}>
      <Field.Root validationMode="onBlur">
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="email"
          required
          placeholder="name@example.com"
          defaultValue="mira.okafor@"
        />
        <Field.Error match="typeMismatch">Enter an email address like name@example.com</Field.Error>
        <Field.Error match="valueMissing">Enter your email address</Field.Error>
        <Field.Description>We send receipts here. Nothing else.</Field.Description>
      </Field.Root>
      <Field.Root disabled>
        <Field.Label optional>Username</Field.Label>
        <Field.Control defaultValue="@miraokafor" />
        <Field.Description>You can change this again in 23 days.</Field.Description>
      </Field.Root>
    </div>
  );
}
