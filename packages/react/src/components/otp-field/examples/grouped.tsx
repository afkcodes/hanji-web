import { Field, OTPField } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <Field.Root style={{ gap: 10 }}>
        <Field.Label>Pairing code on your TV</Field.Label>
        <OTPField.Root length={6} validationType="alphanumeric" size="sm">
          <OTPField.Input />
          <OTPField.Input aria-label="Character 2 of 6" />
          <OTPField.Input aria-label="Character 3 of 6" />
          <OTPField.Separator />
          <OTPField.Input aria-label="Character 4 of 6" />
          <OTPField.Input aria-label="Character 5 of 6" />
          <OTPField.Input aria-label="Character 6 of 6" />
        </OTPField.Root>
        <Field.Description>
          Letters and numbers, shown on the TV under Settings › Devices.
        </Field.Description>
      </Field.Root>
      <Field.Root disabled style={{ gap: 10 }}>
        <Field.Label>Backup code</Field.Label>
        <OTPField.Root length={6} defaultValue="7712" />
        <Field.Description>Too many tries. You can try again in 4 min 32 s.</Field.Description>
      </Field.Root>
    </div>
  );
}
