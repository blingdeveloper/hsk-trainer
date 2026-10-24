import { useEffect, useState } from 'react';
import { loadDictionary, type Dictionary } from './dictionary';

export function useDictionary(): { dict?: Dictionary; error?: string } {
  const [state, setState] = useState<{ dict?: Dictionary; error?: string }>({});
  useEffect(() => {
    let live = true;
    loadDictionary().then(
      (dict) => live && setState({ dict }),
      (err: Error) => live && setState({ error: err.message }),
    );
    return () => {
      live = false;
    };
  }, []);
  return state;
}
