'use client';
import { useRender } from '@base-ui/react/use-render';
import { createTheme } from '@hanji/tokens';
import type { HanjiTheme, ThemeInput } from '@hanji/tokens';
import * as React from 'react';

interface ThemeScopeValue {
  attributes: HanjiTheme['attributes'];
  style: React.CSSProperties | undefined;
}

const ThemeScopeContext = React.createContext<ThemeScopeValue | null>(null);

export interface ThemeProps extends ThemeInput, Omit<React.ComponentProps<'div'>, 'style'> {
  /** A theme from `createTheme()`. Individual fields (paper, accent…) override it. */
  theme?: HanjiTheme;
  /** Paint the paper's background and ink on this element. Off: the wrapper is `display: contents`. */
  surface?: boolean;
  style?: React.CSSProperties;
  /** Render a different element, or compose with your own component. */
  render?: useRender.RenderProp;
}

/**
 * Themes a subtree. Every hanji component below it — including popups portalled to `<body>` —
 * reads this paper, accent, density and motion policy.
 *
 * @example
 * <Theme paper="ink" accent="cobalt" density="compact">…</Theme>
 */
export function Theme(props: ThemeProps): React.ReactElement {
  const {
    theme,
    paper,
    accent,
    density,
    motion,
    radius,
    fonts,
    colors,
    springs,
    surface,
    style,
    render,
    className,
    ...rest
  } = props;
  const input: ThemeInput = { paper, accent, density, motion, radius, fonts, colors, springs };
  const key = JSON.stringify(input);
  // Keyed by the serialised input: inline objects at the call site don't re-resolve the theme.
  // oxlint-disable-next-line react/exhaustive-deps
  const own = React.useMemo(() => createTheme(input), [key]);
  const resolved = React.useMemo<HanjiTheme>(
    () =>
      theme
        ? {
            ...theme,
            attributes: { ...theme.attributes, ...own.attributes },
            vars: { ...theme.vars, ...own.vars },
          }
        : own,
    [theme, own],
  );

  const vars = resolved.vars as React.CSSProperties;
  const hasVars = Object.keys(vars).length > 0;
  const mergedStyle = hasVars || style ? { ...vars, ...style } : undefined;
  const scope = React.useMemo<ThemeScopeValue>(
    () => ({ attributes: resolved.attributes, style: hasVars ? vars : undefined }),
    [resolved, hasVars, vars],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...resolved.attributes,
      ...rest,
      'data-hj-surface': surface ? '' : undefined,
      className: className ? `hj-theme ${className}` : 'hj-theme',
      style: mergedStyle,
    },
  });
  return <ThemeScopeContext.Provider value={scope}>{element}</ThemeScopeContext.Provider>;
}

/**
 * Wraps portalled content in the nearest Theme's attributes, so a popup opened inside
 * `<Theme paper="ink">` is drawn in ink even though it lives under `<body>`.
 */
export function ThemeScope({ children }: { children?: React.ReactNode }): React.ReactNode {
  const scope = React.useContext(ThemeScopeContext);
  if (!scope) return children;
  return (
    <div className="hj-theme" {...scope.attributes} style={scope.style}>
      {children}
    </div>
  );
}

/** The nearest Theme's resolved attributes, or null outside any Theme. */
export function useThemeScope(): ThemeScopeValue | null {
  return React.useContext(ThemeScopeContext);
}
