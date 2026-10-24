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

/** Returns likely characters for the drawn strokes, best match first. Runs on-device. */
export async function recognise(strokes: Stroke[], limit = 8): Promise<string[]> {
  if (strokes.length === 0) return [];
  const reply = await send({ strokes, limit });
  return reply.candidates ?? [];
}
