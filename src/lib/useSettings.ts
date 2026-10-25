import { useCallback, useSyncExternalStore } from 'react';
import { db, DEFAULT_SETTINGS, getSettings, type UserSettings } from '../db/db';
import { level, type LevelConfig } from '../content/levels';

// One shared copy of the settings for the whole app, loaded before the first render
// (see main.tsx), so every screen agrees on the current level straight away.
let current: UserSettings = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

// IndexedDB writes are asynchronous and can be cut off if the page reloads or closes
// straight after a change. So each change is also kept in localStorage (synchronous)
// until the database write finishes, and replayed on the next start if it didn't.
const PENDING_KEY = 'hsk-trainer:pending-settings';

function readPending(): UserSettings | undefined {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as UserSettings) : undefined;
  } catch {
    return undefined;
  }
}

function writePending(s: UserSettings | undefined) {
  try {
    if (s) localStorage.setItem(PENDING_KEY, JSON.stringify(s));
    else localStorage.removeItem(PENDING_KEY);
  } catch {
    // Storage blocked: the database write still happens.
  }
}

async function save(s: UserSettings) {
  writePending(s);
  await db.settings.put(s);
  if (readPending() === undefined || JSON.stringify(readPending()) === JSON.stringify(s)) writePending(undefined);
}

export async function loadSettings(): Promise<void> {
  const pending = readPending();
  if (pending) await save(pending);
  current = await getSettings();
  listeners.forEach((l) => l());
}

/** Forgets unsaved changes, e.g. before replacing everything from a backup. */
export function clearPendingSettings() {
  writePending(undefined);
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
    void save(current);
  }, []);
  return [settings, update];
}

/** The level being studied (HSK 1 or HSK 2). */
export function useLevel(): LevelConfig {
  const [settings] = useSettings();
  return level(settings.targetLevel);
}
