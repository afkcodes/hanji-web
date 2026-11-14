/**
 * Emit the static artefacts: tokens.css (minified by Lightning CSS), tokens.json (resolved values
 * for every paper × accent, for other platforms and for agents) and theme.schema.json.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { transform } from 'lightningcss';

import {
  accentNames,
  accents,
  contrastOn,
  dampingRatio,
  dataSeries,
  densities,
  durations,
  paperNames,
  papers,
  press,
  radius,
  spacing,
  springNames,
  springToCss,
  springs,
  stagger,
  status,
  tokensCss,
  typeScale,
} from '../src/index.ts';
import { themeJsonSchema } from '../src/schema.ts';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
mkdirSync(dist, { recursive: true });

const css = tokensCss();
const { code } = transform({
  filename: 'tokens.css',
  code: Buffer.from(css),
  minify: true,
  targets: { chrome: 123 << 16, safari: (17 << 16) | (5 << 8), firefox: 120 << 16 },
});
writeFileSync(join(dist, 'tokens.css'), code);
writeFileSync(join(dist, 'tokens.readable.css'), css);

const tokens = {
  $description: 'hanji tokens, resolved. Generated — edit packages/tokens/src.',
  papers: Object.fromEntries(paperNames.map((p) => [p, papers[p]])),
  accents: Object.fromEntries(
    accentNames.map((a) => [
      a,
      { ...accents[a], onLight: contrastOn(accents[a].light), onDark: contrastOn(accents[a].dark) },
    ]),
  ),
  status,
  dataSeries,
  spacing,
  radius,
  densities,
  type: typeScale,
  motion: {
    durations,
    stagger,
    press,
    springs: Object.fromEntries(
      springNames.map((n) => [
        n,
        {
          ...springs[n],
          dampingRatio: +dampingRatio(springs[n]).toFixed(3),
          settlesInMs: springToCss(springs[n]).duration,
          clampedSettlesInMs: springToCss(springs[n], true).duration,
        },
      ]),
    ),
  },
};
writeFileSync(join(dist, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`);
writeFileSync(join(dist, 'theme.schema.json'), `${JSON.stringify(themeJsonSchema(), null, 2)}\n`);
console.log(`tokens: css ${code.length} B, json, schema → ${dist}`);
