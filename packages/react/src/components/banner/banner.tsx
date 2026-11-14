'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { prefersReducedMotion } from '../../system/motion.ts';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface BannerState {
  dismiss: () => void;
}
const BannerContext = React.createContext<BannerState>({ dismiss: () => {} });

/** Exit timing: fade out (fast), then the rows close up (base). */
const FADE_MS = 180;
const COLLAPSE_MS = 260;

export interface RootOwnProps {
  /** Glyph and tint. Status is always word + glyph + tint, never colour alone. @default 'neutral' */
  tone?: Tone;
  /** Lead with the tone's glyph. @default true */
  icon?: boolean;
  /** Controlled visibility. */
  open?: boolean;
  /** Uncontrolled initial visibility. @default true */
  defaultOpen?: boolean;
  /** Called when Banner.Dismiss is pressed (after the exit has finished). */
  onOpenChange?: (open: boolean) => void;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * An inline notice that stays until it is resolved or dismissed: a sync problem, a plan limit,
 * an update. Danger and warning are announced as alerts; the rest as status.
 */
export function Root(props: RootProps): React.ReactElement | null {
  const config = useHanjiConfig();
  const {
    tone = 'neutral',
    icon = true,
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Banner.Root', props);
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const [phase, setPhase] = React.useState<'idle' | 'leaving' | 'collapsing'>('idle');
  const ref = React.useRef<HTMLDivElement>(null);
  const onOpenChangeRef = React.useRef(onOpenChange);
  React.useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  // created once: it reads the latest onOpenChange through a ref, so it never goes stale
  const [dismiss] = React.useState(() => (): void => {
    // honours the nearest data-hj-motion, then the system setting
    const reduced = prefersReducedMotion(ref.current);
    setPhase('leaving');
    window.setTimeout(
      () => {
        setPhase('collapsing');
        window.setTimeout(
          () => {
            setPhase('idle');
            setOpenState(false);
            onOpenChangeRef.current?.(false);
          },
          reduced ? 0 : COLLAPSE_MS,
        );
      },
      reduced ? 120 : FADE_MS,
    );
  });
  const ctx = React.useMemo(() => ({ dismiss }), [dismiss]);

  const urgent = tone === 'danger' || tone === 'warning';
  const glyph =
    tone === 'success'
      ? config.icons.checkCircle
      : tone === 'danger'
        ? config.icons.xCircle
        : tone === 'warning'
          ? config.icons.alert
          : config.icons.info;

  const element = useRender({
    render,
    ref,
    defaultTagName: 'div',
    props: {
      role: urgent ? 'alert' : 'status',
      ...rest,
      'data-tone': tone,
      'data-ending-style': phase === 'idle' ? undefined : '',
      'data-collapsing': phase === 'collapsing' ? '' : undefined,
      className: cls(config, 'Banner.Root', 'hj-banner', className) as string | undefined,
      children: (
        <div className={config.unstyled ? undefined : 'hj-banner-inner'}>
          {icon ? (
            <span className={config.unstyled ? undefined : 'hj-banner-glyph'} aria-hidden="true">
              {glyph}
            </span>
          ) : null}
          {children}
        </div>
      ),
    },
  });
  if (!open) return null;
  return <BannerContext.Provider value={ctx}>{element}</BannerContext.Provider>;
}

/** Holds the title and the sentence. */
export const Content: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Banner.Content',
  'hj-banner-content',
);
export const Title: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Banner.Title',
  'hj-banner-title',
);
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Banner.Description',
  'hj-banner-description',
);
/** One or two actions (render Buttons inside). */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Banner.Actions',
  'hj-banner-actions',
);

export interface DismissProps extends Omit<React.ComponentProps<'button'>, 'className'> {
  className?: string;
}

/** The ✕. Fades the banner out, then closes the space it held. */
export function Dismiss(props: DismissProps): React.ReactElement {
  const config = useHanjiConfig();
  const { dismiss } = React.useContext(BannerContext);
  const { className, onClick, children, ...rest } = withDefaults(config, 'Banner.Dismiss', props);
  return (
    <button
      type="button"
      aria-label={children ? undefined : config.strings.dismiss}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) dismiss();
      }}
      className={
        cls(config, 'Banner.Dismiss', 'hj-banner-dismiss', className) as string | undefined
      }
    >
      {children ?? config.icons.x}
    </button>
  );
}
