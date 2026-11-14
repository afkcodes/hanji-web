import { ModelPicker, PromptInput } from '@hanji/react';
import * as React from 'react';

const MODELS = [
  {
    value: 'swift',
    name: 'Swift',
    provider: 'hanji',
    description: 'Quick answers about your library. ~1 s.',
    badges: ['fast'],
  },
  {
    value: 'deep',
    name: 'Deep',
    provider: 'hanji',
    description: 'Plans playlists step by step. Slower, more careful.',
    badges: ['reasoning'],
  },
  {
    value: 'ear',
    name: 'Ear',
    provider: 'hanji',
    description: 'Listens to a clip and names the track.',
    badges: ['audio', 'beta'],
  },
] as const;

export function Example(): React.JSX.Element {
  const [model, setModel] = React.useState<string>('swift');
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <PromptInput.Root>
        <PromptInput.Textarea placeholder="Ask anything about your music" />
        <PromptInput.Toolbar>
          <PromptInput.Attach />
          <ModelPicker.Root
            value={model}
            onValueChange={(v) => setModel(v ?? 'swift')}
            items={MODELS.map((m) => ({ value: m.value, label: m.name }))}
          >
            <ModelPicker.Trigger aria-label="Model" />
            <ModelPicker.Content>
              {MODELS.map((m) => (
                <ModelPicker.Item
                  key={m.value}
                  value={m.value}
                  name={m.name}
                  provider={m.provider}
                  description={m.description}
                  badges={m.badges}
                />
              ))}
            </ModelPicker.Content>
          </ModelPicker.Root>
          <PromptInput.Submit />
        </PromptInput.Toolbar>
      </PromptInput.Root>
    </div>
  );
}
