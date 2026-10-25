import { useCallback, useSyncExternalStore } from 'react';
import { db, DEFAULT_SETTINGS, getSettings, type UserSettings } from '../db/db';
import { level, type LevelConfig } from '../content/levels';

// One shared copy of the settings for the whole app, loaded before the first render
// (see main.tsx), so every screen agrees on the current level straight away.
let current: UserSettings = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

export async function loadSettings(): Promise<void> {
  current = await getSettings();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Settings plus an updater that saves straight away (one write, no read first). */
export function useSettings(): [UserSettings, (patch: Partial<Omit<UserSettings, 'id'>>) => void] {
  const settings = useSyncExternalStore(subscribe, () => current);
  const update = useCallback((patch: Partial<Omit<UserSettings, 'id'>>) => {
    current = { ...current, ...patch };
    listeners.forEach((l) => l());
    void db.settings.put(current);
  }, []);
  return [settings, update];
}

/** The level being studied (HSK 1 or HSK 2). */
export function useLevel(): LevelConfig {
  const [settings] = useSettings();
  return level(settings.targetLevel);
}
