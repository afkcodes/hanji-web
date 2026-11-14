import { Button, Timeline } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Timeline.Root style={{ width: 'min(100%, 420px)' }}>
      <Timeline.Item status="done">
        <Timeline.Title>Collected 48 tracks</Timeline.Title>
        <Timeline.Time dateTime="2026-11-14T21:12" relative="6 min ago">
          21:12
        </Timeline.Time>
      </Timeline.Item>
      <Timeline.Item status="done">
        <Timeline.Title>Converted to FLAC</Timeline.Title>
        <Timeline.Time dateTime="2026-11-14T21:15" relative="3 min ago">
          21:15
        </Timeline.Time>
        <Timeline.Description>212.4 MB · lossless, 44.1 kHz</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item status="failed">
        <Timeline.Title>Upload to Files › Exports</Timeline.Title>
        <Timeline.Time dateTime="2026-11-14T21:17" relative="1 min ago">
          21:17
        </Timeline.Time>
        <Timeline.Description>
          The connection dropped at 61%. Your files are safe on this device.
        </Timeline.Description>
        <Timeline.Actions>
          <Button size="sm">Retry upload</Button>
          <Button size="sm" variant="quiet">
            Save locally
          </Button>
        </Timeline.Actions>
      </Timeline.Item>
      <Timeline.Item status="current">
        <Timeline.Title>Waiting for Wi-Fi</Timeline.Title>
        <Timeline.Time relative="since 21:18">Now</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item status="pending">
        <Timeline.Title>Share with Jun-seo Park</Timeline.Title>
        <Timeline.Time>After upload</Timeline.Time>
      </Timeline.Item>
    </Timeline.Root>
  );
}
