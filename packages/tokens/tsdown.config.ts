import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/schema.ts'],
  format: 'esm',
  platform: 'neutral',
  unbundle: true,
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
  publint: false,
});
