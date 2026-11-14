import { ChoiceCard } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <ChoiceCard.Root aria-label="Plan" name="plan" defaultValue="family" columns={2}>
        <ChoiceCard.Item value="solo">
          <ChoiceCard.Title>Solo</ChoiceCard.Title>
          <ChoiceCard.Description>One account. Downloads on 3 devices.</ChoiceCard.Description>
          <ChoiceCard.Consequence>£10.99 a month</ChoiceCard.Consequence>
        </ChoiceCard.Item>
        <ChoiceCard.Item value="family">
          <ChoiceCard.Title>Family</ChoiceCard.Title>
          <ChoiceCard.Description>
            Six accounts under one roof, each with their own library.
          </ChoiceCard.Description>
          <ChoiceCard.Consequence>£16.99 a month · £2.83 each</ChoiceCard.Consequence>
        </ChoiceCard.Item>
      </ChoiceCard.Root>
    </div>
  );
}
