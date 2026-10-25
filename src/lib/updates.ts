import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

type Listener = () => void;
const listeners = new Set<Listener>();
let waiting = false;

/** Registers the service worker. A new version is installed in the background but only activated on request. */
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    waiting = true;
    listeners.forEach((l) => l());
  },
});

/** True once a new version is downloaded and waiting. */
export function useUpdateAvailable(): [boolean, () => void] {
  const [available, setAvailable] = useState(waiting);
  useEffect(() => {
    const l = () => setAvailable(true);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [available, () => void updateSW(true)];
}
