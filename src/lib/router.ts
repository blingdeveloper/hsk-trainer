import { useEffect, useState } from 'react';

// Hash routes work on any static host (GitHub Pages) and offline.
export type Route =
  | { name: 'home' }
  | { name: 'write' }
  | { name: 'entry'; word: string }
  | { name: 'practice' }
  | { name: 'licences' };

export function parseRoute(hash: string): Route {
  const [, name = '', arg = ''] = hash.replace(/^#/, '').split('/');
  switch (name) {
    case 'write':
      return { name: 'write' };
    case 'entry':
      return arg ? { name: 'entry', word: decodeURIComponent(arg) } : { name: 'write' };
    case 'practice':
      return { name: 'practice' };
    case 'licences':
      return { name: 'licences' };
    default:
      return { name: 'home' };
  }
}

export function href(route: Route): string {
  return route.name === 'entry' ? `#/entry/${encodeURIComponent(route.word)}` : `#/${route.name === 'home' ? '' : route.name}`;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
