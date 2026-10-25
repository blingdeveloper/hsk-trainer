import { useEffect, useState } from 'react';

// Hash routes work on any static host (GitHub Pages) and offline.
export type Route =
  | { name: 'home' }
  | { name: 'write' }
  | { name: 'entry'; word: string }
  | { name: 'practice'; resume?: boolean }
  | { name: 'mistakes' }
  | { name: 'characters'; char?: string }
  | { name: 'licences' }
  | { name: 'settings' };

export function parseRoute(hash: string): Route {
  const [, name = '', arg = ''] = hash.replace(/^#/, '').split('/');
  switch (name) {
    case 'write':
      return { name: 'write' };
    case 'entry':
      return arg ? { name: 'entry', word: decodeURIComponent(arg) } : { name: 'write' };
    case 'practice':
      return arg === 'resume' ? { name: 'practice', resume: true } : { name: 'practice' };
    case 'mistakes':
      return { name: 'mistakes' };
    case 'characters':
      return arg ? { name: 'characters', char: decodeURIComponent(arg) } : { name: 'characters' };
    case 'licences':
      return { name: 'licences' };
    case 'settings':
      return { name: 'settings' };
    default:
      return { name: 'home' };
  }
}

export function href(route: Route): string {
  if (route.name === 'entry') return `#/entry/${encodeURIComponent(route.word)}`;
  if (route.name === 'practice' && route.resume) return '#/practice/resume';
  if (route.name === 'characters' && route.char) return `#/characters/${encodeURIComponent(route.char)}`;
  return `#/${route.name === 'home' ? '' : route.name}`;
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
