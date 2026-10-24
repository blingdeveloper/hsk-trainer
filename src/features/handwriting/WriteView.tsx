import { href } from '../../lib/router';
import HandwritingPad from './HandwritingPad';

export default function WriteView() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Handwriting dictionary</h1>
        <p className="text-sm text-muted">Draw a character, then tap the right one. Recognition runs on your device and nothing is sent anywhere.</p>
      </header>
      <section className="card">
        <HandwritingPad size={Math.min(300, window.innerWidth - 72)} onPick={(c) => (location.hash = href({ name: 'entry', word: c }))} />
      </section>
    </div>
  );
}
