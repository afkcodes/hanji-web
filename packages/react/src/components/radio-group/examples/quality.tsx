import { Radio, RadioGroup } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: 380 }}>
      <h3 id="dl-quality" className="hj-text-eyebrow hj-tone-mute" style={{ marginBottom: 4 }}>
        Download quality
      </h3>
      <RadioGroup.Root aria-labelledby="dl-quality" name="quality" defaultValue="high">
        <RadioGroup.Item>
          <Radio.Root value="normal" />
          <span>
            Normal
            <RadioGroup.Description>
              About 40 MB per hour · saves the most space
            </RadioGroup.Description>
          </span>
        </RadioGroup.Item>
        <RadioGroup.Item>
          <Radio.Root value="high" />
          <span>
            High
            <RadioGroup.Description>About 150 MB per hour</RadioGroup.Description>
          </span>
        </RadioGroup.Item>
        <RadioGroup.Item>
          <Radio.Root value="lossless" disabled />
          <span>
            Lossless
            <RadioGroup.Description>
              About 1.4 GB per hour · needs the Studio plan
            </RadioGroup.Description>
          </span>
        </RadioGroup.Item>
      </RadioGroup.Root>
    </div>
  );
}
