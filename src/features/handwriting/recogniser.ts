import { assetUrl } from '../../lib/assets';

export type Point = [number, number];
export type Stroke = Point[];

type Reply = { id: number; candidates?: string[]; ready?: boolean; error?: string };

let worker: Worker | undefined;
let nextId = 1;
const pending = new Map<number, { resolve: (r: Reply) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(assetUrl('workers/recognise-worker.js'));
    worker.onmessage = (e: MessageEvent<Reply>) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      if (e.data.error) p.reject(new Error(e.data.error));
      else p.resolve(e.data);
    };
  }
  return worker;
}

function send(msg: { strokes?: Stroke[]; limit?: number }): Promise<Reply> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, ...msg });
  });
}

/** Loads the recognition data in the background so the first lookup is fast. */
export async function warmUpRecogniser(): Promise<void> {
  await send({});
}

let studyChars: Promise<Set<string>> | undefined;

/** HSK 1–3 reading characters, used to bring common characters forward. */
function loadStudyChars(): Promise<Set<string>> {
  studyChars ??= fetch(assetUrl('packs/core/hsk.json'))
    .then((r) => r.json())
    .then((d: { readingChars: Record<string, string[]> }) => new Set(Object.values(d.readingChars).flat()))
    .catch(() => new Set<string>());
  return studyChars;
}

/** Places a candidate outside HSK 1–3 moves back, so rare radicals (匸, 丄) don't crowd out common characters. */
export const RARE_PENALTY = 6;

/** Re-ranks recogniser output: recognition order, with a penalty for characters outside the study lists. */
export function rankCandidates(candidates: string[], common: Set<string>, limit: number): string[] {
  return candidates
    .map((c, i) => ({ c, score: i + (common.has(c) ? 0 : RARE_PENALTY) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.c);
}

/** Returns likely characters for the drawn strokes, best match first. Runs on-device. */
export async function recognise(strokes: Stroke[], limit = 10): Promise<string[]> {
  if (strokes.length === 0) return [];
  const [reply, common] = await Promise.all([send({ strokes, limit: 16 }), loadStudyChars()]);
  return rankCandidates(reply.candidates ?? [], common, limit);
}
