import { useEffect, useState } from 'react';

const QUERY = '(min-width: 768px)';

/** True on tablet and desktop widths (Tailwind's `md` breakpoint). */
export function useWide(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}
