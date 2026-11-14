import { DropZone, Field } from '@hanji/react';
import * as React from 'react';

const MB = 1024 * 1024;

interface Doc {
  id: number;
  name: string;
  size: number;
  /** The picked File; rejected files never join the zone, so they carry none. */
  file?: File;
  status: 'uploading' | 'done' | 'error';
  progress?: number;
  error?: string;
  /** Rejected by the zone: nothing to retry. */
  rejected?: boolean;
  /** Simulated upload running. */
  live?: boolean;
}

const pdf = (name: string): File => new File(['%PDF-1.7'], name, { type: 'application/pdf' });

const PAYSLIP = pdf('payslip-september-2026.pdf');
const STATEMENT = pdf('bank-statement-q3.pdf');
const PASSPORT = pdf('passport-noor-haddad.pdf');

const START: Doc[] = [
  { id: 1, name: PAYSLIP.name, size: 412_330, file: PAYSLIP, status: 'done' },
  {
    id: 2,
    name: STATEMENT.name,
    size: 2_518_004,
    file: STATEMENT,
    status: 'uploading',
    progress: 0.6,
  },
  {
    id: 3,
    name: PASSPORT.name,
    size: 1_204_771,
    file: PASSPORT,
    status: 'error',
    error: 'Upload failed — connection lost',
  },
  {
    id: 4,
    name: 'tenancy-reference-scan.pdf',
    size: 14_890_112,
    status: 'error',
    error: 'Over 10 MB',
    rejected: true,
  },
];

let nextId = 5;

export function Example(): React.JSX.Element {
  const [docs, setDocs] = React.useState(START);
  const running = docs.some((d) => d.live);

  // The app uploads; the rows only show it. Here a timer stands in for the network.
  React.useEffect(() => {
    if (!running) return undefined;
    const t = window.setInterval(() => {
      setDocs((list) =>
        list.map((d) => {
          if (!d.live) return d;
          const p = Math.min(1, (d.progress ?? 0) + 0.14);
          return p >= 1
            ? { ...d, status: 'done', progress: undefined, live: false }
            : { ...d, progress: p };
        }),
      );
    }, 450);
    return () => window.clearInterval(t);
  }, [running]);

  const drop = (id: number): void => setDocs((list) => list.filter((d) => d.id !== id));

  return (
    <Field.Root name="documents" style={{ width: '100%', maxWidth: 560 }}>
      <Field.Label>Supporting documents</Field.Label>
      <Field.Description>
        Your two latest payslips, a bank statement from the last three months and photo ID.
      </Field.Description>
      <DropZone.Root
        accept="application/pdf"
        multiple
        maxSize={10 * MB}
        maxFiles={6}
        defaultFiles={[PAYSLIP, STATEMENT, PASSPORT]}
        onFilesChange={(_, { added }) =>
          setDocs((list) => [
            ...list,
            ...added.map((file) => ({
              id: nextId++,
              name: file.name,
              size: file.size,
              file,
              status: 'uploading' as const,
              progress: 0,
              live: true,
            })),
          ])
        }
        onReject={(rejections) =>
          setDocs((list) => [
            ...list,
            ...rejections.map((r) => ({
              id: nextId++,
              name: r.file.name,
              size: r.file.size,
              status: 'error' as const,
              error: r.message,
              rejected: true,
            })),
          ])
        }
      >
        <DropZone.Area>
          <DropZone.Icon />
          <DropZone.Content>
            <DropZone.Prompt />
            <DropZone.Hint>PDF only · up to 10 MB each · 6 files at most</DropZone.Hint>
          </DropZone.Content>
          <DropZone.Trigger />
        </DropZone.Area>
        <DropZone.List>
          {docs.map((d) => (
            <DropZone.File
              key={d.id}
              file={d.file}
              name={d.name}
              size={d.size}
              status={d.status}
              progress={d.progress}
              error={d.error}
              onRemove={() => drop(d.id)}
              onRetry={
                d.rejected
                  ? undefined
                  : () =>
                      setDocs((list) =>
                        list.map((x) =>
                          x.id === d.id
                            ? {
                                ...x,
                                status: 'uploading',
                                progress: 0,
                                error: undefined,
                                live: true,
                              }
                            : x,
                        ),
                      )
              }
            />
          ))}
        </DropZone.List>
      </DropZone.Root>
    </Field.Root>
  );
}
