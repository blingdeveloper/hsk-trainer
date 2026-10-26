import { assetUrl } from '../lib/assets';
import type { LevelId } from './types';

interface HskPack {
  writingChars: Record<string, string[]>;
  readingChars: Record<string, string[]>;
}

let pack: Promise<HskPack> | undefined;

function loadPack(): Promise<HskPack> {
  pack ??= fetch(assetUrl('packs/core/hsk.json')).then((r) => r.json());
  return pack;
}

/**
 * Writing characters for a level. The syllabus gives one 书写字 list for HSK 1–2
 * together (100 characters). For HSK 1 we show the 95 of them that are HSK 1 reading
 * characters; the other 5 (比 地 过 为 长) are first read at HSK 2.
 */
export async function loadWritingChars(level: LevelId): Promise<string[]> {
  const { writingChars, readingChars } = await loadPack();
  const all = writingChars['1-2'];
  if (level === 2) return all;
  const l1 = new Set(readingChars[1]);
  return all.filter((c) => l1.has(c));
}
