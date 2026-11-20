import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ui/ErrorBoundary';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './index.css';
import './lib/updates';
// Listen for the browser's install offer from the start: it can arrive before the first render.
import './lib/install';
import { loadSettings } from './lib/useSettings';

// Settings decide the level shown everywhere, so load them before the first render.
void loadSettings()
  .catch(() => {})
  .finally(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        {/* Last line of defence for errors outside a page (navigation, banners). */}
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    ),
  );
