'use client';
import { Fieldset as Base } from '@base-ui/react/fieldset';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** Groups related fields; `disabled` disables every Field inside. */
export const Root: HanjiPart<typeof Base.Root> = part(Base.Root, 'Fieldset.Root', 'hj-fieldset');
/** One line under the legend: what this group is for. */
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Fieldset.Description',
  'hj-fieldset-description',
);

export interface LegendOwnProps {
  /** title = a section heading (default) · eyebrow = a quiet caps label for small groups. */
  variant?: 'title' | 'eyebrow';
}
export interface LegendProps extends LegendOwnProps, Base.Legend.Props {}

/** Names the group (announced with every field in it). */
export function Legend(props: LegendProps): React.ReactElement {
  const config = useHanjiConfig();
  const { variant = 'title', className, ...rest } = withDefaults(config, 'Fieldset.Legend', props);
  return (
    <Base.Legend
      {...rest}
      data-variant={variant}
      className={cls(config, 'Fieldset.Legend', 'hj-fieldset-legend', className)}
    />
  );
}
