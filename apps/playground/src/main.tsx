import { tokensCss } from '@hanji/tokens';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../../../packages/react/src/styles/base.css';
import './playground.css';
import { App } from './app.tsx';

// Tokens straight from source, so a token edit hot-reloads like any other change.
const tokens = document.createElement('style');
tokens.dataset.hanji = 'tokens';
tokens.textContent = tokensCss();
document.head.prepend(tokens);

// Every component stylesheet, then utilities last (cascade layers keep the order honest).
import.meta.glob('../../../packages/react/src/components/*/*.css', { eager: true });
import.meta.glob('../../../packages/react/src/styles/utilities.css', { eager: true });

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
