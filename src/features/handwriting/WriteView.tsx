import { href } from '../../lib/router';
import { useWide } from '../../lib/useWide';
import HandwritingPad from './HandwritingPad';

export default function WriteView() {
  const wide = useWide();
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">Handwriting dictionary</h1>
        <p className="text-sm text-muted">Draw a character, then tap the right one. Recognition runs on your device and nothing is sent anywhere.</p>
      </header>
      <div className="grid items-start gap-4 md:grid-cols-[auto_1fr]">
        <section className="card md:p-6">
          <HandwritingPad size={wide ? 380 : Math.min(300, window.innerWidth - 72)} onPick={(c) => (location.hash = href({ name: 'entry', word: c }))} />
        </section>
        <section className="card hidden space-y-2 text-sm text-muted md:block">
          <h2 className="font-medium text-ink">Tips for better results</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Write one character, filling most of the box.</li>
            <li>Use the standard stroke order and count: top to bottom, left to right.</li>
            <li>Draw each stroke in one go. Strokes that bend (like 乙 or the hook in 了) are single strokes.</li>
            <li>If the right character isn't in the list, use Undo stroke and redraw the last one.</li>
          </ul>
          <p className="pt-2">
            Picking a candidate opens its entry: pinyin, meanings, words that use it, and stroke-order animation.
          </p>
        </section>
      </div>
    </div>
  );
}
