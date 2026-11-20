import { useState } from 'react';
import { install, useInstallState } from '../lib/install';

const HIDDEN_KEY = 'hsk-install-card-hidden';

function readHidden(): boolean {
  try {
    return localStorage.getItem(HIDDEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Offers to install the app. Shows a button where the browser allows it, steps for iPhone/iPad,
 * and nothing when the app is already installed or the browser can't install apps.
 * With `dismissible` (Home), "Not now" hides it there; Settings always keeps it.
 */
export default function InstallCard({ dismissible = false }: { dismissible?: boolean }) {
  const state = useInstallState();
  const [hidden, setHidden] = useState(() => dismissible && readHidden());
  if (state === 'installed' || state === 'unsupported' || hidden) return null;

  function hide() {
    try {
      localStorage.setItem(HIDDEN_KEY, '1');
    } catch {
      // Private browsing: hide for this visit only.
    }
    setHidden(true);
  }

  return (
    <section
      className="card grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 sm:grid-cols-[auto_1fr_auto]"
      aria-labelledby="install-title"
      data-testid="install-card"
    >
      <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-2xl" />
      <div className="min-w-0 text-sm">
        <h2 id="install-title" className="font-medium">
          Install HSK Trainer
        </h2>
        {state === 'ready' && <p className="text-muted">Open it from your home screen or desktop like any app, without the browser. Works offline.</p>}
        {state === 'ios' && (
          <p className="text-muted" data-testid="install-ios-steps">
            Tap the <span className="font-medium text-ink">Share</span> button{' '}
            <span aria-hidden className="inline-block rounded border border-line px-1 leading-tight">
              ⬆︎
            </span>
            , then <span className="font-medium text-ink">Add to Home Screen</span>.
          </p>
        )}
      </div>
      {(state === 'ready' || dismissible) && (
        <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1">
          {state === 'ready' && (
            <button type="button" className="btn-primary" onClick={() => void install()} data-testid="install-button">
              Install app
            </button>
          )}
          {dismissible && (
            <button type="button" className="btn-ghost" onClick={hide} data-testid="install-hide">
              Not now
            </button>
          )}
        </div>
      )}
    </section>
  );
}
