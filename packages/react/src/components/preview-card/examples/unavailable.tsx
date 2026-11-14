import { Icon, PreviewCard } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <p style={{ maxWidth: 440, margin: 0, fontSize: 15, lineHeight: 1.6 }}>
      Dev shared{' '}
      <PreviewCard.Root>
        <PreviewCard.Trigger href="#playlist/winter-2024">Winter, slowly</PreviewCard.Trigger>
        <PreviewCard.Content arrow>
          <PreviewCard.Body>
            <PreviewCard.Title>
              <Icon name="alert" size={16} style={{ color: 'var(--hj-warning)', marginRight: 6 }} />
              No longer available
            </PreviewCard.Title>
            <PreviewCard.Description>
              Dev Malhotra made this playlist private on 2 Nov. Ask them to share it again.
            </PreviewCard.Description>
          </PreviewCard.Body>
        </PreviewCard.Content>
      </PreviewCard.Root>{' '}
      with you last winter.
    </p>
  );
}
