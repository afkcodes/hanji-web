import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repo = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Workspace packages resolve to their TypeScript source: instant HMR, no package builds.
  resolve: { conditions: ['@hanji/source', 'module', 'browser', 'development|production'] },
  server: { port: 4420, fs: { allow: [repo] } },
});
