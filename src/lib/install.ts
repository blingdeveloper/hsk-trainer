// "Install app": lets people add HSK Trainer to their home screen or desktop, on their terms.
//
// Chrome, Edge and Samsung Internet fire `beforeinstallprompt` when the app can be installed.
// We keep that event so an Install button can open the browser's install dialog at any time,
// instead of waiting for the browser's own pop-up. Safari on iPhone/iPad has no such event:
// there, people install with Share → Add to Home Screen, so we explain that instead.
import { useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * - `installed`: running as the installed app, or just installed.
 * - `ready`: the browser allows installing now; `install()` opens its dialog.
 * - `ios`: Safari on iPhone/iPad: show Share → Add to Home Screen steps.
 * - `unsupported`: this browser can't install apps (e.g. Firefox on a computer), or hasn't offered yet.
 */
export type InstallState = 'installed' | 'ready' | 'ios' | 'unsupported';

let deferred: BeforeInstallPromptEvent | undefined;
let justInstalled = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iPhone, iPod or iPad (iPadOS reports itself as a Mac with a touch screen). */
export function isAppleMobile(ua = navigator.userAgent, touchPoints = navigator.maxTouchPoints ?? 0): boolean {
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1);
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Stop the browser's own mini pop-up; our button offers the same dialog whenever the person wants it.
  e.preventDefault();
  deferred = e as BeforeInstallPromptEvent;
  notify();
});

window.addEventListener('appinstalled', () => {
  deferred = undefined;
  justInstalled = true;
  notify();
});

window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', notify);

function read(): InstallState {
  if (justInstalled || isStandalone()) return 'installed';
  if (deferred) return 'ready';
  if (isAppleMobile()) return 'ios';
  return 'unsupported';
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, read);
}

/** Opens the browser's install dialog. Resolves true if the person installed the app. */
export async function install(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  // The event can only be used once; the browser fires a new one if installing is still possible.
  deferred = undefined;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === 'accepted';
}
