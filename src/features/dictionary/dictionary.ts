import { assetUrl } from '../../lib/assets';

export interface DictionaryEntry {
  simplified: string;
  traditional?: string;
  pinyin: string;
  definitions: string[];
  /** HSK 3.0 level from the official syllabus; undefined when the word isn't listed. */
  hskLevel?: number;
}

export interface DictionaryMeta {
  source: string;
  url: string;
  licence: string;
  version: string;
  hskTags: string;
}

type Row = [string, string, string, string[], number];

export class Dictionary {
  private byWord = new Map<string, DictionaryEntry[]>();
  private byChar = new Map<string, string[]>();

  constructor(rows: Row[], readonly meta: DictionaryMeta) {
    for (const [simplified, trad, pinyin, definitions, level] of rows) {
      const entry: DictionaryEntry = { simplified, pinyin, definitions };
      if (trad) entry.traditional = trad;
      if (level) entry.hskLevel = level;
      const list = this.byWord.get(simplified);
      if (list) list.push(entry);
      else this.byWord.set(simplified, [entry]);
    }
    // CC-CEDICT lists proper-noun readings (capitalised pinyin, e.g. 大学 "Da4 xue2",
    // the classic text) alongside common ones; show the common reading first.
    const isProper = (e: DictionaryEntry) => e.pinyin[0] !== e.pinyin[0].toLowerCase();
    for (const list of this.byWord.values()) {
      list.sort((a, b) => Number(isProper(a)) - Number(isProper(b)));
    }
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
