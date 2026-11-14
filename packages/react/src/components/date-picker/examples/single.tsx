import { Button, DatePicker } from '@hanji/react';

const today = new Date();
const inDays = (n: number): Date =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

function Presets(): React.JSX.Element {
  const { set, close } = DatePicker.useDatePickerActions();
  return (
    <DatePicker.Footer>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          set(inDays(1));
          close();
        }}
      >
        Tomorrow
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          set(inDays(7));
          close();
        }}
      >
        In a week
      </Button>
      <Button size="sm" variant="quiet" onClick={() => set(null)}>
        Clear
      </Button>
    </DatePicker.Footer>
  );
}

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 22, width: 300 }}>
      <div>
        <DatePicker.Root min={today} name="reminder" isDateDisabled={(d) => d.getDay() === 0}>
          <DatePicker.Label>Remind me on</DatePicker.Label>
          <DatePicker.Trigger placeholder="Pick a day" />
          <DatePicker.Content>
            <Presets />
          </DatePicker.Content>
        </DatePicker.Root>
      </div>
      <div>
        <DatePicker.Root disabled defaultValue={inDays(-30)}>
          <DatePicker.Label>Member since</DatePicker.Label>
          <DatePicker.Trigger size="sm" />
          <DatePicker.Content />
        </DatePicker.Root>
      </div>
    </div>
  );
}
