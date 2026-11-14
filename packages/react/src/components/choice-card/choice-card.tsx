'use client';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseGroup } from '@base-ui/react/radio-group';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export interface RootOwnProps {
  /** Cards per row. `auto` fits as many 220px cards as the width allows. */
  columns?: 1 | 2 | 3 | 4 | 'auto';
}
export interface RootProps extends RootOwnProps, React.ComponentProps<typeof BaseGroup> {}

/** A radio group drawn as cards, for options that each deserve a sentence about their consequence. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const { columns = 'auto', className, ...rest } = withDefaults(config, 'ChoiceCard.Root', props);
  return (
    <BaseGroup
      {...rest}
      data-columns={columns}
      className={cls(config, 'ChoiceCard.Root', 'hj-choice-card', className)}
    />
  );
}

export interface ItemOwnProps {
  /** Draw the radio ring in the card's corner. @default true */
  indicator?: boolean;
}
export interface ItemProps extends ItemOwnProps, BaseRadio.Root.Props {}

/** One card — a radio. Put a Title, a Description and a Consequence inside. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    indicator = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'ChoiceCard.Item', props);
  const styled = !config.unstyled;
  return (
    <BaseRadio.Root
      {...rest}
      data-indicator={flag(indicator)}
      className={cls(config, 'ChoiceCard.Item', 'hj-choice-card-item', className)}
    >
      {indicator ? (
        <span className={styled ? 'hj-choice-card-ring' : undefined} aria-hidden="true">
          <BaseRadio.Indicator keepMounted className={styled ? 'hj-choice-card-dot' : undefined} />
        </span>
      ) : null}
      {children}
    </BaseRadio.Root>
  );
}

/** The option's name. */
export const Title: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'ChoiceCard.Title',
  'hj-choice-card-title',
);
/** What it is, in a sentence. */
export const Description: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'ChoiceCard.Description',
  'hj-choice-card-description',
);
/** What it costs: data, money, time — set in mono at the foot of the card. */
export const Consequence: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'ChoiceCard.Consequence',
  'hj-choice-card-consequence',
);
