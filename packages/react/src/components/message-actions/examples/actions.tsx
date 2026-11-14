import { Icon, Message, MessageActions } from '@hanji/react';
import * as React from 'react';

const REPLY =
  'Your most played song in October was “Night Bus Home” by Noor Haddad — 47 plays, mostly between 22:00 and midnight.';

export function Example(): React.JSX.Element {
  const [rating, setRating] = React.useState<'up' | 'down' | null>(null);
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Message.Root from="assistant">
        <Message.Avatar>한</Message.Avatar>
        <Message.Content>{REPLY}</Message.Content>
        <Message.Footer>
          <MessageActions.Root text={REPLY}>
            <MessageActions.Copy />
            <MessageActions.Regenerate />
            <MessageActions.Separator />
            <MessageActions.Feedback value={rating} onValueChange={setRating} />
            <MessageActions.Action label="More">
              <Icon name="more" size={16} />
            </MessageActions.Action>
          </MessageActions.Root>
          {rating ? (
            <span>{rating === 'up' ? 'Thanks — noted.' : 'Thanks. Tell us what was wrong?'}</span>
          ) : null}
        </Message.Footer>
      </Message.Root>
    </div>
  );
}
