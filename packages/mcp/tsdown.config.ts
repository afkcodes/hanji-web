import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  format: 'esm',
  platform: 'node',
  unbundle: true,
  fixedExtension: false,
  dts: true,
  clean: true,
  external: [/^@modelcontextprotocol\//, /^@hanji\//, 'zod'],
});
