import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

/** Offline install status: pending until the service worker is ready or registration fails. */
export type OfflineState = 'pending' | 'ready' | 'unavailable';

type Listener = () => void;
const listeners = new Set<Listener>();
let updateWaiting = false;
let offline: OfflineState = 'serviceWorker' in navigator ? 'pending' : 'unavailable';

function notify() {
  listeners.forEach((l) => l());
}

/** Registers the service worker. A new version is installed in the background but only activated on request. */
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateWaiting = true;
    notify();
  },
  onRegisterError() {
    // e.g. embedded browsers that block service workers. The app still works online.
    offline = 'unavailable';
    notify();
  },
});

if (offline === 'pending') {
  navigator.serviceWorker.ready.then(() => {
    offline = 'ready';
    notify();
  });
}

function useStore<T>(read: () => T): T {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const l = () => setValue(read());
    listeners.add(l);
    l();
    return () => {
      listeners.delete(l);
    };
  }, [read]);
  return value;
}

const readUpdate = () => updateWaiting;
const readOffline = () => offline;

/** True once a new version is downloaded and waiting, plus a function that activates it and reloads. */
export function useUpdateAvailable(): [boolean, () => void] {
  return [useStore(readUpdate), () => void updateSW(true)];
}

export function useOfflineState(): OfflineState {
  return useStore(readOffline);
}
