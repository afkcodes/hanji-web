import { z } from 'zod';

import { isHex } from './color.ts';
import { springNames } from './motion.ts';
import { accentNames, paperNames } from './palette.ts';
import { DENSITY_MAX, DENSITY_MIN } from './scale.ts';
import { createTheme } from './theme.ts';
import type { HanjiTheme, ThemeInput } from './theme.ts';

const hex = z
  .string()
  .refine(isHex, 'Expected a hex colour such as #b81f18')
  .describe('A hex colour, #rgb or #rrggbb.');

const ramp = z
  .object({
    light: hex.describe(
      'Stop used on light paper. Should be deep enough for 4.5:1 text on #f0ece3.',
    ),
    dark: hex.describe('Stop used on ink and charcoal. Should be light enough to read on black.'),
  })
  .describe('A colour pair: hanji picks the stop from the element’s colour scheme.');

const colorValue = z.union([hex, ramp]);

const springOverride = z
  .object({
    damping: z.number().positive().max(400),
    stiffness: z.number().positive().max(20000),
    mass: z.number().positive().max(20).optional(),
  })
  .describe('A spring. Compiled to a CSS linear() easing at theme time — no runtime cost.');

const schema = z
  .object({
    paper: z
      .enum([...paperNames, 'auto'])
      .describe(
        'The ground. paper = warm light; ink = true black (OLED); charcoal = soft dark; auto = paper by day, charcoal at night.',
      )
      .optional(),
    accent: z
      .union([z.enum(accentNames), ramp])
      .describe(
        'One accent per app, spent where the user acts or has chosen. A preset name, or a custom {light, dark} pair.',
      )
      .optional(),
    density: z
      .union([z.enum(['cozy', 'compact']), z.number().min(DENSITY_MIN).max(DENSITY_MAX)])
      .describe(
        'Spacing multiplier. cozy = 1, compact = .7. Hairlines and 44px touch targets never shrink.',
      )
      .optional(),
    motion: z
      .enum(['system', 'full', 'reduced'])
      .describe(
        'Motion policy. system follows prefers-reduced-motion. reduced: springs ~40ms, travel becomes fade, ambient loops never start.',
      )
      .optional(),
    radius: z
      .union([z.enum(['sharp', 'soft', 'round']), z.number().min(0).max(2)])
      .describe(
        'Corner scale. sharp = .5×, soft = 1× (hanji), round = 1.4×, or a number. Pills stay pills.',
      )
      .optional(),
    smoothing: z
      .number()
      .min(0)
      .max(1)
      .describe(
        "Corner smoothing: 0 = circular corners, .72 = hanji's squircle (default), 1 = most continuous. Drawn with CSS corner-shape where supported.",
      )
      .optional(),
    fonts: z
      .object({
        sans: z.string().describe('CSS font-family stack for every role except mono.'),
        mono: z
          .string()
          .describe('CSS font-family stack for the mono role (timecodes, counts, values).'),
      })
      .partial()
      .describe('Font stacks. hanji does not load fonts; load them in your app.')
      .optional(),
    colors: z
      .object({
        danger: colorValue,
        success: colorValue,
        warning: colorValue,
        info: colorValue,
        seal: colorValue,
      })
      .partial()
      .describe('Override status colours. Soft tints are re-derived from these.')
      .optional(),
    springs: z
      .object(
        Object.fromEntries(springNames.map((n) => [n, springOverride])) as Record<
          (typeof springNames)[number],
          typeof springOverride
        >,
      )
      .partial()
      .describe(
        'Override the spring vocabulary. snappy = controls, gentle = arrivals, bouncy = celebration.',
      )
      .optional(),
  })
  .strict()
  .describe('hanji theme');

/** Runtime validator for {@link ThemeInput}, with field-level messages. */
export const themeSchema: z.ZodType<ThemeInput> = schema as z.ZodType<ThemeInput>;

/** Validate with zod (readable, field-level errors), then resolve. For tools and agents. */
export function parseTheme(input: unknown): HanjiTheme {
  return createTheme(themeSchema.parse(input));
}

/** Validate without throwing: `{ success, error }` with an issue list an agent can act on. */
export function checkThemeInput(
  input: unknown,
): { success: true } | { success: false; issues: { path: string; message: string }[] } {
  const r = themeSchema.safeParse(input);
  if (r.success) return { success: true };
  return {
    success: false,
    issues: r.error.issues.map((i) => ({ path: i.path.join('.') || '(root)', message: i.message })),
  };
}

/** The theme contract as JSON Schema (draft 2020-12). */
export function themeJsonSchema(): Record<string, unknown> {
  return z.toJSONSchema(schema, { target: 'draft-2020-12', io: 'input' }) as Record<
    string,
    unknown
  >;
}
