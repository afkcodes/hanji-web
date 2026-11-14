import { Button, Icon, Tooltip } from '@hanji/react';

const tools = [
  { label: 'Add to queue', icon: 'plus' },
  { label: 'Copy link', icon: 'copy' },
  { label: 'Search in playlist', icon: 'search' },
  { label: 'More', icon: 'more' },
] as const;

export function Example(): React.JSX.Element {
  return (
    <Tooltip.Provider>
      <div style={{ display: 'flex', gap: 4 }}>
        {tools.map((t) => (
          <Tooltip.Hint key={t.label} label={t.label}>
            <Button variant="quiet" iconOnly aria-label={t.label}>
              <Icon name={t.icon} />
            </Button>
          </Tooltip.Hint>
        ))}
        <Tooltip.Hint label="Downloads need Wi-Fi — change it in Settings">
          <Button
            variant="quiet"
            iconOnly
            aria-label="Download (needs Wi-Fi)"
            focusableWhenDisabled
            disabled
          >
            <Icon name="arrowUp" style={{ rotate: '180deg' }} />
          </Button>
        </Tooltip.Hint>
      </div>
    </Tooltip.Provider>
  );
}
