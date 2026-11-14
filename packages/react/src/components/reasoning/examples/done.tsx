import { Reasoning } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Reasoning.Root duration={12}>
        <Reasoning.Trigger />
        <Reasoning.Panel>
          <p>
            Checked October’s plays: 1,906 in total. The top artist by minutes is Noor Haddad (6 h
            12 min), but by plays it is Kōya Lanes, because their tracks are short.
          </p>
          <p>
            The question was “most listened”, so minutes is the fairer measure. Answer with Noor
            Haddad and mention the difference.
          </p>
        </Reasoning.Panel>
      </Reasoning.Root>
    </div>
  );
}
