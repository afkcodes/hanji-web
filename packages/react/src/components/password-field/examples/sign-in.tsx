import { PasswordField } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 22, width: 360 }}>
      <PasswordField.Root invalid>
        <PasswordField.Label>Password</PasswordField.Label>
        <PasswordField.Input defaultValue="night-bus" />
        <PasswordField.Error match>
          That password doesn’t match this account. You have 2 tries left.
        </PasswordField.Error>
      </PasswordField.Root>
      <PasswordField.Root disabled>
        <PasswordField.Label>App password</PasswordField.Label>
        <PasswordField.Input defaultValue="xxxx-xxxx-xxxx" revealable={false} />
        <PasswordField.Description>
          Managed by your organisation’s sign-in.
        </PasswordField.Description>
      </PasswordField.Root>
    </div>
  );
}
