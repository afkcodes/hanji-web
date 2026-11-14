'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { prefersReducedMotion } from '../../system/motion.ts';
import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

/** DOM writes live outside the component: the element is state, and render-time values stay immutable. */
function jumpToEnd(el: HTMLElement): void {
  el.scrollTop = el.scrollHeight;
}
function glideToEnd(el: HTMLElement, smooth: boolean): void {
  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth && !prefersReducedMotion(el) ? 'smooth' : 'auto',
  });
}
function distanceToEnd(el: HTMLElement): number {
  return el.scrollHeight - el.scrollTop - el.clientHeight;
}

interface ConversationContextValue {
  atBottom: boolean;
  streaming: boolean;
  scrollToBottom: (smooth?: boolean) => void;
  setViewport: (el: HTMLDivElement | null) => void;
  setContent: (el: HTMLDivElement | null) => void;
}

const ConversationContext = React.createContext<ConversationContextValue | null>(null);

function useConversation(part: string): ConversationContextValue {
  const ctx = React.useContext(ConversationContext);
  if (!ctx) throw new Error(`[hanji] Conversation.${part} must be inside Conversation.Root`);
  return ctx;
}

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /**
   * A reply is arriving. The log is aria-busy (screen readers wait for the finished message)
   * and the view keeps the newest text in sight unless the person has scrolled up.
   */
  streaming?: boolean;
  /** How close to the end (px) still counts as “at the bottom”. @default 48 */
  threshold?: number;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * A scrolling conversation that sticks to the newest message while it streams — until the
 * person scrolls up to read; then a “Jump to latest” button appears.
 *
 * @example
 * <Conversation.Root streaming={status === 'streaming'} style={{ height: 560 }}>
 *   <Conversation.Viewport>
 *     <Conversation.Content>{messages.map(…)}</Conversation.Content>
 *   </Conversation.Viewport>
 *   <Conversation.JumpToLatest />
 * </Conversation.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const [config, { streaming = false, threshold = 48, className, render, children, ...rest }] =
    useSlot('Conversation.Root', props);
  const [atBottom, setAtBottom] = React.useState(true);
  // Elements live in state: stable setters, and observers re-attach only when they change.
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
  const [content, setContent] = React.useState<HTMLDivElement | null>(null);
  const stick = React.useRef(true);
  const gliding = React.useRef(false); // a programmatic smooth scroll is under way

  const scrollToBottom = React.useCallback(
    (smooth = true) => {
      if (!viewport) return;
      stick.current = true;
      gliding.current = smooth;
      setAtBottom(true);
      glideToEnd(viewport, smooth);
    },
    [viewport],
  );

  React.useEffect(() => {
    if (!viewport) return;
    const measure = (): void => {
      const near = distanceToEnd(viewport) <= threshold;
      if (gliding.current) {
        // Our own smooth scroll is still travelling: don't mistake it for the person leaving.
        if (near) gliding.current = false;
        return;
      }
      stick.current = near;
      setAtBottom(near);
    };
    const userIntent = (): void => {
      gliding.current = false;
    };
    // Growth (a new message, a streamed line) keeps the end in view while sticking.
    const ro = new ResizeObserver(() => {
      if (stick.current) jumpToEnd(viewport);
      else measure();
    });
    if (content) ro.observe(content);
    ro.observe(viewport);
    viewport.addEventListener('scroll', measure, { passive: true });
    viewport.addEventListener('wheel', userIntent, { passive: true });
    viewport.addEventListener('touchstart', userIntent, { passive: true });
    viewport.addEventListener('keydown', userIntent);
    jumpToEnd(viewport);
    return () => {
      ro.disconnect();
      viewport.removeEventListener('scroll', measure);
      viewport.removeEventListener('wheel', userIntent);
      viewport.removeEventListener('touchstart', userIntent);
      viewport.removeEventListener('keydown', userIntent);
    };
  }, [viewport, content, threshold]);

  const ctx = React.useMemo<ConversationContextValue>(
    () => ({ atBottom, streaming, scrollToBottom, setViewport, setContent }),
    [atBottom, streaming, scrollToBottom],
  );

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-at-bottom': flag(atBottom),
      'data-streaming': flag(streaming),
      className: cls(config, 'Conversation.Root', 'hj-conversation', className) as
        | string
        | undefined,
      children: <ConversationContext.Provider value={ctx}>{children}</ConversationContext.Provider>,
    },
  });
}

/** The scroll container. Focusable so keyboard users can scroll the history. */
export function Viewport(props: React.ComponentProps<'div'>): React.ReactElement {
  const [config, { className, ...rest }] = useSlot('Conversation.Viewport', props);
  const { setViewport } = useConversation('Viewport');
  return (
    <div
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region must be keyboard-reachable (WCAG 2.1.1)
      tabIndex={0}
      aria-label="Conversation"
      {...rest}
      ref={setViewport}
      className={
        cls(config, 'Conversation.Viewport', 'hj-conversation-viewport', className) as
          | string
          | undefined
      }
    />
  );
}

/**
 * The message list: role="log", aria-live="polite", aria-busy while streaming — so a finished
 * reply is announced once, not token by token.
 */
export function Content(props: React.ComponentProps<'div'>): React.ReactElement {
  const [config, { className, ...rest }] = useSlot('Conversation.Content', props);
  const { setContent, streaming } = useConversation('Content');
  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      {...rest}
      ref={setContent}
      aria-busy={streaming || undefined}
      className={
        cls(config, 'Conversation.Content', 'hj-conversation-content', className) as
          | string
          | undefined
      }
    />
  );
}

export interface JumpToLatestOwnProps {
  /** @default 'Jump to latest' */
  label?: string;
}
export interface JumpToLatestProps
  extends JumpToLatestOwnProps, Omit<BaseButton.Props, 'onClick'> {}

/** Appears (rise + fade) when the person has scrolled away from the newest message. */
export function JumpToLatest(props: JumpToLatestProps): React.ReactElement {
  const [config, { label = 'Jump to latest', className, children, ...rest }] = useSlot(
    'Conversation.JumpToLatest',
    props,
  );
  const ctx = useConversation('JumpToLatest');
  const hidden = ctx.atBottom;
  return (
    <BaseButton
      type="button"
      {...rest}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
      data-hidden={flag(hidden)}
      className={cls(config, 'Conversation.JumpToLatest', 'hj-conversation-jump', className)}
      onClick={() => ctx.scrollToBottom(true)}
    >
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
      {children ?? label}
    </BaseButton>
  );
}
