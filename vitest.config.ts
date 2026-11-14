import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { conditions: ['@hanji/source'] },
  test: {
    projects: [
      {
        resolve: { conditions: ['@hanji/source'] },
        test: { name: 'tokens', include: ['packages/tokens/**/*.test.ts'], environment: 'node' },
      },
      {
        resolve: { conditions: ['@hanji/source'] },
        test: {
          name: 'react',
          include: ['packages/react/src/**/*.test.tsx', 'packages/react/src/**/*.test.ts'],
          environment: 'happy-dom',
          setupFiles: ['packages/react/test/setup.ts'],
        },
      },
      {
        resolve: { conditions: ['@hanji/source'] },
        test: { name: 'mcp', include: ['packages/mcp/**/*.test.ts'], environment: 'node' },
      },
    ],
  },
});
