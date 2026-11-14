import { Button, Field, Fieldset, Form } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Form.Root layout="grid" style={{ width: 560 }} onFormSubmit={() => undefined}>
      <Fieldset.Root>
        <Fieldset.Legend>Billing address</Fieldset.Legend>
        <Fieldset.Description>Used for receipts and to work out tax.</Fieldset.Description>
      </Fieldset.Root>
      <Field.Root name="first">
        <Field.Label>First name</Field.Label>
        <Field.Control autoComplete="given-name" defaultValue="Jun-seo" required />
      </Field.Root>
      <Field.Root name="last">
        <Field.Label>Last name</Field.Label>
        <Field.Control autoComplete="family-name" defaultValue="Park" required />
      </Field.Root>
      <Field.Root name="postcode">
        <Field.Label>Postcode</Field.Label>
        <Field.Control autoComplete="postal-code" defaultValue="04524" required />
      </Field.Root>
      <Field.Root name="city">
        <Field.Label>City</Field.Label>
        <Field.Control autoComplete="address-level2" defaultValue="Seoul" required />
      </Field.Root>
      <Form.Actions>
        <Button variant="secondary" type="reset">
          Reset
        </Button>
        <Button type="submit">Save address</Button>
      </Form.Actions>
    </Form.Root>
  );
}
