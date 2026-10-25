import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './index.css';
import './lib/updates';
import { loadSettings } from './lib/useSettings';

// Settings decide the level shown everywhere, so load them before the first render.
void loadSettings()
  .catch(() => {})
  .finally(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  );
