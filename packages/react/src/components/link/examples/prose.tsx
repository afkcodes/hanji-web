import { Link, Text } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 440 }}>
      <Text tone="dim">
        Downloads stay on this device for 30 days offline. Read how{' '}
        <Link href="#offline">offline listening</Link> works, or visit the{' '}
        <Link href="https://help.example.com/downloads" external>
          help centre
        </Link>
        .
      </Text>
      <Text variant="sub" tone="mute">
        By continuing you agree to the{' '}
        <Link href="#terms" tone="dim">
          terms of service
        </Link>
        .
      </Text>
    </div>
  );
}
