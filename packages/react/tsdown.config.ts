import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'browser',
  // One output file per source module: tree-shakes per component and keeps 'use client' on
  // every module that needs it.
  unbundle: true,
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: [/^react($|\/)/, /^react-dom($|\/)/, /^@base-ui\/react($|\/)/, /^@hanji\/tokens($|\/)/],
  publint: false,
  inputOptions: {
    // Directives are preserved: unbundle keeps one module per file (verified in dist).
    onLog(level, log, handler) {
      if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
      handler(level, log);
    },
  },
});
