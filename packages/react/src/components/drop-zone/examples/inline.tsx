import { Button, DropZone, Field, Form } from '@hanji/react';
import * as React from 'react';

const MB = 1024 * 1024;

export function Example(): React.JSX.Element {
  const [proof, setProof] = React.useState<File[]>([]);
  const [sent, setSent] = React.useState<string>();
  return (
    <Form.Root
      style={{ width: '100%', maxWidth: 460 }}
      onFormSubmit={() => setSent(proof.map((f) => f.name).join(', '))}
    >
      <Field.Root name="legalName">
        <Field.Label>Legal name</Field.Label>
        <Field.Control autoComplete="name" defaultValue="Tomás Reyes" required />
      </Field.Root>

      <Field.Root name="proofOfAddress">
        <Field.Label>Proof of address</Field.Label>
        <DropZone.Root
          accept="application/pdf,image/jpeg,image/png"
          maxSize={5 * MB}
          required
          files={proof}
          onFilesChange={(files) => {
            setProof(files);
            setSent(undefined);
          }}
        >
          <DropZone.Area layout="inline">
            <DropZone.Icon />
            <DropZone.Content>
              <DropZone.Prompt />
              <DropZone.Hint>PDF, JPG or PNG · up to 5 MB</DropZone.Hint>
            </DropZone.Content>
            <DropZone.Trigger />
          </DropZone.Area>
          {proof.length > 0 ? (
            <DropZone.List>
              {proof.map((f) => (
                <DropZone.File key={f.name} file={f} />
              ))}
            </DropZone.List>
          ) : null}
        </DropZone.Root>
        <Field.Description>
          A utility bill or bank letter from the last three months.
        </Field.Description>
        <Field.Error match="valueMissing">Add a proof of address to continue.</Field.Error>
      </Field.Root>

      <Field.Root name="companyCertificate" disabled>
        <Field.Label optional>Certificate of incorporation</Field.Label>
        <DropZone.Root accept="application/pdf">
          <DropZone.Area layout="inline" />
        </DropZone.Root>
        <Field.Description>
          Only for limited companies — you applied as a sole trader.
        </Field.Description>
      </Field.Root>

      <Form.Actions>
        <Button type="submit">Continue</Button>
      </Form.Actions>
      <p aria-live="polite" style={{ margin: 0, fontSize: 13 }}>
        {sent ? `Ready to send: ${sent}` : null}
      </p>
    </Form.Root>
  );
}
