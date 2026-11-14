import { Field, Fieldset } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Fieldset.Root style={{ width: 360 }}>
      <Fieldset.Legend variant="eyebrow">Emergency contact</Fieldset.Legend>
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Field.Control defaultValue="Noor Haddad" />
      </Field.Root>
      <Field.Root>
        <Field.Label optional>Phone</Field.Label>
        <Field.Control type="tel" placeholder="+44 7700 900123" />
        <Field.Description>We only call if we can’t reach you.</Field.Description>
      </Field.Root>
    </Fieldset.Root>
  );
}
