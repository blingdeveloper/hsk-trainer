// Search the offline dictionary by pinyin ("nihao", "xie3", "mā") or English ("write").
// Everything runs on the device, using the CC-CEDICT pack that is already loaded.
import { isProper, isVariantOnly, rank, type Dictionary, type DictionaryEntry } from './dictionary';

export interface SearchResult {
  word: string;
  /** The reading that matched (for English, the best reading of the word). */
  entry: DictionaryEntry;
  /** HSK level to show, if any. */
  level?: number;
  /** For a single character with no level of its own: the HSK word that gives it one (妈 → 妈妈). */
  via?: string;
}

export interface SearchResults {
  pinyin: SearchResult[];
  english: SearchResult[];
  /** The query was Chinese characters that have an entry: open it directly. */
  direct?: string;
  /** Show English matches first: they fit the query better ("big" is a word, "Bǐgān" a stretch). */
  englishFirst?: boolean;
}

interface Syllable {
  base: string; // toneless, ü written as v
  tone: number; // 1–4, or 5 for neutral
}

interface Item {
  word: string;
  entry: DictionaryEntry;
  syllables: Syllable[];
  /** Lower-cased meanings, split on ";", without "to " at the start. */
  glosses: { text: string; core: string; index: number }[];
  /** All glosses joined, for a quick "could this match at all" check. */
  haystack: string;
  level?: number;
  via?: string;
  /** Rank among the word's readings: HSK reading 0, common 1, proper noun 2, variant 3. */
  readingRank: number;
}

interface QuerySyllable {
  base: string;
  tone?: number;
  /** The last thing typed isn't a full syllable yet ("zh"): match syllables that start with it. */
  partial?: boolean;
}

const TONE_MARK: Record<string, number> = { '\u0304': 1, '\u0301': 2, '\u030c': 3, '\u0300': 4 };

/** "mā" → { base: "ma", tone: 1 }; "lǜ" → { base: "lv", tone: 4 }. Undefined for "·", ",", "A". */
function parseSyllable(raw: string): Syllable | undefined {
  const s = raw.normalize('NFD').toLowerCase();
  let tone = 5;
  for (const ch of s) if (TONE_MARK[ch]) tone = TONE_MARK[ch];
  const base = s.replace(/u\u0308/g, 'v').replace(/u:/g, 'v').replace(/[\u0300-\u036f]/g, '');
  return /^[a-z]+$/.test(base) ? { base, tone } : undefined;
}

const LEADING = /^(to|a|an|the) /;
const REF = /[\p{Script=Han}|]*\[[^\]]*\]|\p{Script=Han}+/gu;
const SKIP_DEF = /^(CL:|(old |archaic |erroneous )?variant of|see |also pr\.|Taiwan pr\.|used in |surname )/i;

export class DictionarySearch {
  private items: Item[] = [];
  private byFirst = new Map<string, Item[]>();
  private syllables = new Set<string>();
  private prefixes = new Set<string>();

  constructor(private dict: Dictionary) {
    // A character with no level of its own takes the level of the HSK words it appears in.
    const charLevel = new Map<string, { level: number; via: string }>();
    for (const word of dict.words()) {
      const chars = [...word];
      if (chars.length < 2) continue;
      const level = dict.level(word);
      if (!level || level > 6) continue;
      for (const ch of chars) {
        const known = charLevel.get(ch);
        if (!known || level < known.level || (level === known.level && word.length < known.via.length)) charLevel.set(ch, { level, via: word });
      }
    }

    for (const word of dict.words()) {
      const entries = dict.lookup(word);
      const someHskReading = entries.some((e) => e.hskReading);
      for (const entry of entries) {
        if (isVariantOnly(entry)) continue;
        const syllables = entry.pinyin.split(' ').map(parseSyllable).filter((s): s is Syllable => !!s);
        if (!syllables.length) continue;
        // A level belongs to the HSK reading: 写 xiě is HSK 1, 写 xiè isn't.
        const isTheReading = entry.hskReading || (!someHskReading && !isProper(entry));
        let level = isTheReading ? entry.hskLevel : undefined;
        let via: string | undefined;
        if (!entry.hskLevel && isTheReading && [...word].length === 1) {
          const inherited = charLevel.get(word);
          if (inherited) ({ level, via } = inherited);
        }
        const glosses: Item['glosses'] = [];
        entry.definitions.forEach((def, index) => {
          if (SKIP_DEF.test(def)) return;
          for (const piece of def.split(';')) {
            // Cross-references like "超级市场[chao1 ji2 shi4 chang3]" hold pinyin, not English.
            const text = piece.replace(REF, ' ').replace(/\s+/g, ' ').trim().toLowerCase().replace(LEADING, '');
            if (!text) continue;
            const core = text.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim().replace(LEADING, '');
            glosses.push({ text, core, index });
          }
        });
        const item: Item = { word, entry, syllables, glosses, haystack: glosses.map((g) => g.text).join(' | '), level, via, readingRank: rank(entry) };
        this.items.push(item);
        const first = syllables[0].base;
        const list = this.byFirst.get(first);
        if (list) list.push(item);
        else this.byFirst.set(first, [item]);
        for (const s of syllables) if (s.base !== 'xx') this.syllables.add(s.base);
      }
    }
    for (const s of this.syllables) for (let i = 1; i <= s.length; i++) this.prefixes.add(s.slice(0, i));
  }

  /**
   * Ways to read the typed text as pinyin, or [] if it can't be pinyin.
   * "nihao" → [[ni, hao]]; "xian" → [[xian], [xi, an]]; "ni3hao" → [[ni(3), hao]]; "zh" → [[zh…]].
   */
  parsePinyin(query: string): QuerySyllable[][] {
    const letters: { ch: string; tone?: number }[] = [];
    const breaks = new Set<number>(); // a syllable must end before letters[i]
    for (const ch of query.trim().toLowerCase().normalize('NFD')) {
      const prev = letters[letters.length - 1];
      if (/[a-z]/.test(ch)) letters.push({ ch });
      else if (ch === '\u0308' && prev?.ch === 'u') prev.ch = 'v';
      else if (ch === ':' && prev?.ch === 'u') prev.ch = 'v';
      else if (TONE_MARK[ch] && prev) prev.tone = TONE_MARK[ch];
      else if (/[1-5]/.test(ch) && prev && prev.tone === undefined) {
        prev.tone = Number(ch);
        breaks.add(letters.length);
      } else if (/[\s'’-]/.test(ch)) breaks.add(letters.length);
      else return [];
    }
    if (!letters.length) return [];

    const chunks: (typeof letters)[] = [];
    let start = 0;
    for (const b of [...[...breaks].sort((a, b) => a - b), letters.length]) {
      if (b > start) chunks.push(letters.slice(start, b));
      start = Math.max(start, b);
    }

    const tone = (part: typeof letters) => part.find((l) => l.tone !== undefined)?.tone;
    const LIMIT = 12;
    const split = (chunk: typeof letters, last: boolean): QuerySyllable[][] => {
      const out: QuerySyllable[][] = [];
      const walk = (from: number, acc: QuerySyllable[]) => {
        if (out.length >= LIMIT) return;
        if (from === chunk.length) return void out.push(acc);
        // Longest syllable first, so "xian" is tried before "xi an".
        for (let to = Math.min(chunk.length, from + 6); to > from; to--) {
          const part = chunk.slice(from, to);
          const base = part.map((l) => l.ch).join('');
          if (this.syllables.has(base)) walk(to, [...acc, { base, tone: tone(part) }]);
          else if (last && to === chunk.length && this.prefixes.has(base) && tone(part) === undefined) {
            walk(to, [...acc, { base, partial: true }]);
          }
        }
      };
      walk(0, []);
      return out;
    };

    let ways: QuerySyllable[][] = [[]];
    chunks.forEach((chunk, i) => {
      const options = split(chunk, i === chunks.length - 1);
      ways = ways.flatMap((w) => options.map((o) => [...w, ...o])).slice(0, LIMIT);
    });
    return ways.filter((w) => w.length > 0);
  }

  search(query: string, studying: number, limit = 200): SearchResults {
    const q = query.trim();
    if (!q) return { pinyin: [], english: [] };
    if (/\p{Script=Han}/u.test(q)) {
      return { pinyin: [], english: [], direct: this.dict.toSimplified(q.replace(/\s+/g, '')) };
    }
    const pinyin = this.searchPinyin(q, studying, limit);
    const english = this.searchEnglish(q, studying, limit, pinyin.length > 0);
    const top = (r: SearchResult[]) => (r.length ? bucket(r[0].level, studying) : 99);
    return { pinyin, english, englishFirst: top(english) < top(pinyin) };
  }

  private searchPinyin(q: string, studying: number, limit: number): SearchResult[] {
    const best = new Map<string, { item: Item; tier: number }>();
    for (const way of this.parsePinyin(q)) {
      const first = way[0];
      const candidates = first.partial
        ? [...this.byFirst].filter(([base]) => base.startsWith(first.base)).flatMap(([, list]) => list)
        : this.byFirst.get(first.base) ?? [];
      for (const item of candidates) {
        const s = item.syllables;
        if (way.length > s.length) continue;
        const ok = way.every((w, i) => (w.partial ? s[i].base.startsWith(w.base) : s[i].base === w.base) && (w.tone === undefined || s[i].tone === w.tone));
        if (!ok) continue;
        // 0: the whole word was typed (吗 for "ma"); 1: the start of a longer word (妈妈) or of a syllable.
        const tier = s.length === way.length && !way.some((w) => w.partial) ? 0 : 1;
        keep(best, item, tier, studying);
      }
    }
    return finish(best, studying, limit);
  }

  /**
   * @param strict The text also reads as pinyin with matches ("shi", "ma"), so only keep clear English
   * matches: whole words, and only HSK words unless the meaning is exactly what was typed.
   */
  private searchEnglish(raw: string, studying: number, limit: number, strict = false): SearchResult[] {
    const q = raw.toLowerCase().replace(/\s+/g, ' ').trim().replace(LEADING, '');
    if (!/^[a-z][a-z '-]*$/.test(q)) return [];
    const esc = q.replace(/[-]/g, '\\-');
    const whole = new RegExp(`(^|[^a-z])${esc}($|[^a-z])`);
    const start = new RegExp(`(^|[^a-z])${esc}`);
    const best = new Map<string, { item: Item; tier: number; index: number }>();
    for (const item of this.items) {
      if (!item.haystack.includes(q)) continue;
      let tier = 9;
      let index = 99;
      for (const g of item.glosses) {
        // 0: the meaning is exactly what was typed ("to write" for "write");
        // 1: the word appears in it; 2: a word starts with it ("writ" → "write").
        const t = g.core === q ? 0 : whole.test(g.text) ? 1 : q.length >= 3 && start.test(g.text) ? 2 : 9;
        if (t < tier || (t === tier && g.index < index)) [tier, index] = [t, g.index];
      }
      if (tier === 9 || (strict && (tier === 2 || (tier === 1 && !item.level)))) continue;
      keep(best, item, tier, studying, index);
    }
    return finish(best, studying, limit);
  }
}

/** 0: in the exam you're studying for; then the rest of HSK 1–2, HSK 3, higher levels, and no level. */
function bucket(level: number | undefined, studying: number): number {
  if (!level) return 4;
  if (level <= studying) return 0;
  if (level <= 2) return 1;
  if (level <= 3) return 2;
  return 3;
}

type Scored = { item: Item; tier: number; index?: number };

function compare(a: Scored, b: Scored, studying: number): number {
  return (
    bucket(a.item.level, studying) - bucket(b.item.level, studying) ||
    a.tier - b.tier ||
    a.item.readingRank - b.item.readingRank ||
    (a.index ?? 0) - (b.index ?? 0) ||
    a.item.syllables.length - b.item.syllables.length ||
    (a.item.level ?? 99) - (b.item.level ?? 99) ||
    a.item.word.localeCompare(b.item.word, 'zh')
  );
}

/** One result per word: its best-matching reading. */
function keep(best: Map<string, Scored>, item: Item, tier: number, studying: number, index?: number) {
  const next: Scored = { item, tier, index };
  const known = best.get(item.word);
  if (!known || compare(next, known, studying) < 0) best.set(item.word, next);
}

function finish(best: Map<string, Scored>, studying: number, limit: number): SearchResult[] {
  return [...best.values()]
    .sort((a, b) => compare(a, b, studying))
    .slice(0, limit)
    .map(({ item }) => ({ word: item.word, entry: item.entry, level: item.level, via: item.via }));
}

const cache = new WeakMap<Dictionary, DictionarySearch>();

/** The search index for a dictionary, built once on first use. */
export function searchIndex(dict: Dictionary): DictionarySearch {
  let index = cache.get(dict);
  if (!index) cache.set(dict, (index = new DictionarySearch(dict)));
  return index;
}
