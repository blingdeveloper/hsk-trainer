import { useCallback, useEffect, useRef, useState } from 'react';
import { db, DEFAULT_SETTINGS, getSettings, type UserSettings } from '../db/db';

/** Settings from IndexedDB, with an updater that saves straight away (one write, no read first). */
export function useSettings(): [UserSettings, (patch: Partial<Omit<UserSettings, 'id'>>) => void] {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const latest = useRef(settings);
  useEffect(() => {
    void getSettings().then((s) => {
      latest.current = s;
      setSettings(s);
    });
  }, []);
  const update = useCallback((patch: Partial<Omit<UserSettings, 'id'>>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setSettings(next);
    void db.settings.put(next);
  }, []);
  return [settings, update];
}
