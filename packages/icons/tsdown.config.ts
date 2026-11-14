import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/dynamic.tsx', 'src/adapter.tsx', 'src/catalog.ts'],
  format: 'esm',
  platform: 'browser',
  // One output module per icon: importing IconHome ships IconHome and nothing else.
  unbundle: true,
  fixedExtension: false,
  dts: true,
  sourcemap: false,
  clean: true,
  target: 'es2022',
  external: [/^react($|\/)/],
  publint: false,
});
