'use client';
import * as React from 'react';

import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

/** Props hanji adds on top of a `<span>`. */
export interface StreamingTextOwnProps {
  /** A token stream. Each chunk is appended as it arrives; React never re-renders per token. */
  stream?: AsyncIterable<string>;
  /**
   * Controlled text. When it grows by a suffix only the delta is appended; anything else
   * replaces the text. Use this when your state already holds the full message.
   */
  text?: string;
  /** Controlled mode only: show the caret while more text is coming. @default false */
  streaming?: boolean;
  /** Show the blinking caret while streaming. @default true */
  caret?: boolean;
  /** Called once with the full text when `stream` ends. */
  onDone?: (text: string) => void;
  /** Called if `stream` throws. The text received so far stays on screen. */
  onError?: (error: unknown) => void;
}

export interface StreamingTextProps
  extends StreamingTextOwnProps, Omit<React.ComponentProps<'span'>, 'children' | 'onError'> {}

interface Tap {
  text: string;
  done: boolean;
  failed: boolean;
  error: unknown;
  subs: Set<() => void>;
}

/**
 * Each stream is read exactly once, however many times effects re-run (StrictMode) or however
 * many components render it. Subscribers are told when text arrives.
 */
const taps = new WeakMap<AsyncIterable<string>, Tap>();
function tap(stream: AsyncIterable<string>): Tap {
  const existing = taps.get(stream);
  if (existing) return existing;
  const t: Tap = { text: '', done: false, failed: false, error: undefined, subs: new Set() };
  taps.set(stream, t);
  const tell = (): void => {
    for (const fn of t.subs) fn();
  };
  void (async () => {
    try {
      for await (const chunk of stream) {
        t.text += chunk;
        tell();
      }
    } catch (error) {
      t.failed = true;
      t.error = error;
    }
    t.done = true;
    tell();
  })();
  return t;
}

/**
 * Renders streamed text with zero React work per token: chunks are buffered and appended to a
 * single text node once per animation frame.
 *
 * @example
 * <StreamingText stream={response.textStream} onDone={save} />
 * <StreamingText text={message.text} streaming={message.status === 'streaming'} />
 */
export function StreamingText(props: StreamingTextProps): React.ReactElement {
  const [
    config,
    {
      stream,
      text,
      streaming: streamingProp = false,
      caret = true,
      onDone,
      onError,
      className,
      ...rest
    },
  ] = useSlot('StreamingText', props);

  const textRef = React.useRef<HTMLSpanElement>(null);
  const node = React.useRef<Text | null>(null);
  // The first render's text is React's child; from then on the node is owned here.
  const [initial] = React.useState(() => text ?? '');
  // The stream that has finished (set from the flush callback, never synchronously in an effect).
  const [doneStream, setDoneStream] = React.useState<AsyncIterable<string> | null>(null);
  const done = React.useRef({ onDone, onError });
  React.useLayoutEffect(() => {
    done.current = { onDone, onError };
  });

  const getNode = React.useCallback((): Text | null => {
    const host = textRef.current;
    if (!host) return null;
    if (!node.current || node.current.parentNode !== host) {
      const existing = host.firstChild;
      if (existing && existing.nodeType === 3) node.current = existing as Text;
      else {
        node.current = document.createTextNode('');
        host.append(node.current);
      }
    }
    return node.current;
  }, []);

  // Controlled text: append the delta, or replace.
  React.useLayoutEffect(() => {
    if (text === undefined) return;
    const n = getNode();
    if (!n) return;
    if (text.startsWith(n.data)) {
      if (text.length > n.data.length) n.appendData(text.slice(n.data.length));
    } else {
      n.data = text;
    }
  }, [text, getNode]);

  // Stream: read once (tap), flush whatever arrived once per frame.
  React.useEffect(() => {
    if (!stream) return;
    const t = tap(stream);
    let written = 0;
    let raf = 0;
    let finished = false;
    const n = getNode();
    if (n) n.data = '';
    const flush = (): void => {
      raf = 0;
      if (t.text.length > written) {
        getNode()?.appendData(t.text.slice(written));
        written = t.text.length;
      }
      if (t.done && !finished) {
        finished = true;
        setDoneStream(stream);
        if (t.failed) done.current.onError?.(t.error);
        else done.current.onDone?.(t.text);
      }
    };
    const notify = (): void => {
      if (!raf) raf = requestAnimationFrame(flush);
    };
    t.subs.add(notify);
    notify();
    return () => {
      t.subs.delete(notify);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stream, getNode]);

  const streaming = stream ? doneStream !== stream : streamingProp;
  const styled = !config.unstyled;
  return (
    <span
      {...rest}
      data-streaming={flag(streaming)}
      aria-busy={streaming || undefined}
      className={cls(config, 'StreamingText', 'hj-streaming-text', className) as string | undefined}
    >
      <span ref={textRef} className={styled ? 'hj-streaming-text-body' : undefined}>
        {initial}
      </span>
      {caret && streaming ? (
        <span className={styled ? 'hj-streaming-text-caret' : undefined} aria-hidden="true" />
      ) : null}
    </span>
  );
}
