import { assetUrl } from '../../lib/assets';

export interface DictionaryEntry {
  simplified: string;
  traditional?: string;
  pinyin: string;
  definitions: string[];
  /** HSK 3.0 level from the official syllabus; undefined when the word isn't listed. */
  hskLevel?: number;
  /** This is the reading the HSK syllabus uses (e.g. 要 yào, not yāo). */
  hskReading?: boolean;
}

export interface DictionaryMeta {
  source: string;
  url: string;
  licence: string;
  version: string;
  hskTags: string;
}

type Row = [string, string, string, string[], number, number?];

export class Dictionary {
  private byWord = new Map<string, DictionaryEntry[]>();
  private byChar = new Map<string, string[]>();
  /** Traditional form → simplified form, for words whose forms differ (學 → 学). */
  private tradToSimp = new Map<string, string>();

  constructor(rows: Row[], readonly meta: DictionaryMeta) {
    for (const [simplified, trad, pinyin, definitions, level, hskReading] of rows) {
      const entry: DictionaryEntry = { simplified, pinyin, definitions };
      if (trad) {
        entry.traditional = trad;
        if (!this.tradToSimp.has(trad)) this.tradToSimp.set(trad, simplified);
      }
      if (level) entry.hskLevel = level;
      if (hskReading) entry.hskReading = true;
      const list = this.byWord.get(simplified);
      if (list) list.push(entry);
      else this.byWord.set(simplified, [entry]);
    }
    // Reading order: the HSK reading first, then common readings, then proper nouns
    // (大学 "Dà xué", the classic text), and "variant of …" cross-references last.
    for (const list of this.byWord.values()) list.sort((a, b) => rank(a) - rank(b));
    for (const word of this.byWord.keys()) {
      const chars = [...word];
      if (chars.length < 2) continue;
      for (const ch of new Set(chars)) {
        const list = this.byChar.get(ch);
        if (list) list.push(word);
        else this.byChar.set(ch, [word]);
      }
    }
  }

  lookup(word: string): DictionaryEntry[] {
    return this.byWord.get(word) ?? [];
  }

  /**
   * The simplified form to show for `word`: itself when it is a simplified headword,
   * its simplified form when it is traditional (學 → 学), otherwise undefined.
   * Multi-character traditional text is converted character by character as a fallback.
   */
  toSimplified(word: string): string | undefined {
    if (this.byWord.has(word)) return word;
    const direct = this.tradToSimp.get(word);
    if (direct) return direct;
    const chars = [...word];
    if (chars.length < 2) return undefined;
    const converted = chars.map((c) => (this.byWord.has(c) ? c : this.tradToSimp.get(c) ?? c)).join('');
    return this.byWord.has(converted) ? converted : undefined;
  }

  has(word: string): boolean {
    return this.byWord.has(word);
  }

  /** Lowest HSK level any reading of the word is tagged with. */
  level(word: string): number | undefined {
    const levels = this.lookup(word).map((e) => e.hskLevel).filter((l): l is number => !!l);
    return levels.length ? Math.min(...levels) : undefined;
  }

  /**
   * Dictionary-confirmed words containing `char`. HSK-tagged words come first
   * (lowest level first), then shorter words.
   */
  wordsContaining(char: string, limit = 40): string[] {
    const words = this.byChar.get(char) ?? [];
    return [...words]
      .sort((a, b) => (this.level(a) ?? 99) - (this.level(b) ?? 99) || a.length - b.length || a.localeCompare(b, 'zh'))
      .slice(0, limit);
  }
}

const isProper = (e: DictionaryEntry) => e.pinyin[0] !== e.pinyin[0].toLowerCase();
const isVariantOnly = (e: DictionaryEntry) => e.definitions.every((d) => /^(old |archaic |erroneous )?variant of|^see /i.test(d));

function rank(e: DictionaryEntry): number {
  if (e.hskReading) return 0;
  if (isVariantOnly(e)) return 3;
  return isProper(e) ? 2 : 1;
}

let loading: Promise<Dictionary> | undefined;

export function loadDictionary(): Promise<Dictionary> {
  loading ??= fetch(assetUrl('packs/core/dict.json'))
    .then((res) => {
      if (!res.ok) throw new Error(`Dictionary pack failed to load (HTTP ${res.status})`);
      return res.json();
    })
    .then((data: { meta: DictionaryMeta; entries: Row[] }) => new Dictionary(data.entries, data.meta))
    .catch((err) => {
      loading = undefined;
      throw err;
    });
  return loading;
}
