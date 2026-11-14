'use client';
import { CheckboxGroup as Base } from '@base-ui/react/checkbox-group';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

export interface RootOwnProps {
  /** Stack (default) or lay the options out in a row. */
  orientation?: 'vertical' | 'horizontal';
}
export interface RootProps extends RootOwnProps, React.ComponentProps<typeof Base> {}

/**
 * Several related checkboxes sharing one value array. Give it `allValues` and mark one
 * `<Checkbox.Root parent />` to get a “Select all” that goes mixed when some are ticked.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    orientation = 'vertical',
    className,
    ...rest
  } = withDefaults(config, 'CheckboxGroup.Root', props);
  return (
    <Base
      {...rest}
      data-orientation={orientation}
      className={cls(config, 'CheckboxGroup.Root', 'hj-checkbox-group', className)}
    />
  );
}

/** One option row: a `<label>` holding a Checkbox.Root and its text, so the whole row toggles. */
export const Item: (props: ElementPartProps<'label'>) => React.ReactElement = elementPart(
  'label',
  'CheckboxGroup.Item',
  'hj-checkbox-group-item',
);

/** The children under a parent checkbox, indented to its text. */
export const Children: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'CheckboxGroup.Children',
  'hj-checkbox-group-children',
);

/** Secondary line inside an Item (size, count, consequence). */
export const Description: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'CheckboxGroup.Description',
  'hj-checkbox-group-description',
);
