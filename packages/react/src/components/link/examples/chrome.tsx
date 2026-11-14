import { Link } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <nav aria-label="Footer" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14 }}>
      <Link href="#about" tone="fg" underline="hover">
        About
      </Link>
      <Link href="#privacy" tone="fg" underline="hover">
        Privacy
      </Link>
      <Link href="#accessibility" tone="fg" underline="hover">
        Accessibility
      </Link>
      <Link href="https://status.example.com" tone="dim" underline="hover" external>
        Service status
      </Link>
    </nav>
  );
}
