import { PasswordField } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <PasswordField.Root style={{ width: 360 }} validationMode="onBlur">
      <PasswordField.Label>New password</PasswordField.Label>
      <PasswordField.Input
        autoComplete="new-password"
        required
        minLength={12}
        placeholder="At least 12 characters"
      />
      <PasswordField.Strength minLength={12} />
      <PasswordField.Error match="tooShort">
        Use at least 12 characters — a short phrase is easier to remember.
      </PasswordField.Error>
      <PasswordField.Error match="valueMissing">Choose a password to continue.</PasswordField.Error>
    </PasswordField.Root>
  );
}
