import { numberedToMarked, wordPinyin } from '../../lib/pinyin';

/** Part of a formatted definition: plain text, or a reference to another word. */
export type Segment = { text: string } | { word: string; pinyin: string };

export interface FormattedDefinition {
  kind: 'meaning' | 'measure';
  segments: Segment[];
}

// CC-CEDICT references: optional "traditional|" then simplified, then [numbered pinyin].
// "CL:個|个[ge4]", "see 四書|四书[Si4 shu1]", "also pr. [yi1 hui3 r5]".
const REF = /(?:(\p{Script=Han}+)\|)?(\p{Script=Han}*)\[([A-Za-z0-9:\s,·]+)\]/gu;

function segments(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(REF)) {
    const [whole, , simp, numbered] = m;
    if (m.index! > last) out.push({ text: text.slice(last, m.index) });
    const marked = numberedToMarked(numbered.trim());
    if (simp) out.push({ word: simp, pinyin: wordPinyin(simp, marked) });
    else out.push({ text: marked });
    last = m.index! + whole.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** Turns CC-CEDICT notation into readable parts: measure words, linked references, tone-marked pinyin. */
export function formatDefinition(def: string): FormattedDefinition {
  const cl = /^CL:(.*)$/.exec(def);
  if (cl) return { kind: 'measure', segments: segments(cl[1].replace(/,/g, ', ')) };
  return { kind: 'meaning', segments: segments(def.replace(/^Taiwan pr\./, 'Taiwan pronunciation:').replace(/^also pr\./, 'also pronounced')) };
}

/** Plain-text version, for short previews. */
export function definitionText(def: string): string {
  const f = formatDefinition(def);
  const body = f.segments.map((s) => ('word' in s ? `${s.word} (${s.pinyin})` : s.text)).join('');
  return f.kind === 'measure' ? `measure word: ${body}` : body;
}
