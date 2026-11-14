'use client';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseGroup } from '@base-ui/react/radio-group';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

export interface RootOwnProps {
  /** Stack (default) or lay the options out in a row. */
  orientation?: 'vertical' | 'horizontal';
}
export interface RootProps extends RootOwnProps, React.ComponentProps<typeof BaseGroup> {}

/** Exactly one of a few options. Arrow keys move and select; Tab leaves the group. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    orientation = 'vertical',
    className,
    ...rest
  } = withDefaults(config, 'RadioGroup.Root', props);
  return (
    <BaseGroup
      {...rest}
      data-orientation={orientation}
      className={cls(config, 'RadioGroup.Root', 'hj-radio-group', className)}
    />
  );
}

/** One option row: a `<label>` with a Radio.Root and its text, so the whole row selects. */
export const Item: (props: ElementPartProps<'label'>) => React.ReactElement = elementPart(
  'label',
  'RadioGroup.Item',
  'hj-radio-group-item',
);

/** A help line under an Item's text. */
export const Description: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'RadioGroup.Description',
  'hj-radio-group-description',
);

/** The dot. Kept mounted so it can scale out as well as in. */
export const Indicator: HanjiPart<typeof BaseRadio.Indicator> = part(
  BaseRadio.Indicator,
  'Radio.Indicator',
  'hj-radio-group-indicator',
);

export interface RadioOwnProps {
  /** md = 22 (hanji), sm = 18. */
  size?: 'sm' | 'md';
}
export interface RadioProps extends RadioOwnProps, BaseRadio.Root.Props {}

/** The 22px ring. Renders its Indicator when childless, so `<Radio.Root value="x" />` is complete. */
export function Radio(props: RadioProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', className, children, ...rest } = withDefaults(config, 'Radio.Root', props);
  return (
    <BaseRadio.Root
      {...rest}
      data-size={size}
      className={cls(config, 'Radio.Root', 'hj-radio-group-radio', className)}
    >
      {children ?? <Indicator keepMounted />}
    </BaseRadio.Root>
  );
}
