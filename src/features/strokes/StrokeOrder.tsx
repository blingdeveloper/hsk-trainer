import { useEffect, useRef, useState } from 'react';
import HanziWriter, { type CharacterJson } from 'hanzi-writer';
import { assetUrl } from '../../lib/assets';

/** Loads bundled stroke data for Hanzi Writer. Works offline once cached. */
export function loadStrokeData(c: string): Promise<CharacterJson> {
  return fetch(assetUrl(`packs/strokes/${c}.json`)).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`No stroke data for ${c}`))));
}

/** Stroke-order animation from bundled hanzi-writer-data (Arphic licence). */
export default function StrokeOrder({ char, size = 160 }: { char: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    setMissing(false);
    writerRef.current = HanziWriter.create(el, char, {
      width: size,
      height: size,
      padding: 8,
      strokeColor: '#2b2326',
      radicalColor: '#c9677a',
      outlineColor: '#eedfdf',
      delayBetweenStrokes: 250,
      charDataLoader: (c, onLoad, onError) => {
        loadStrokeData(c)
          .then(onLoad)
          .catch((err) => {
            setMissing(true);
            onError(err);
          });
      },
    });
    return () => {
      writerRef.current = null;
    };
  }, [char, size]);

  if (missing) {
    return <p className="text-sm text-muted">No stroke-order data offline for this character (only HSK 1–3 characters are bundled).</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} data-testid="stroke-order" className="rounded-xl border border-line bg-paper" style={{ width: size, height: size }} />
      <button type="button" className="btn-secondary text-sm" onClick={() => writerRef.current?.animateCharacter()}>
        ▶ Play stroke order
      </button>
    </div>
  );
}
