# Research: searching by pinyin or English (HSK 1 and HSK 2)

Date: 2026-11-13. Built the same day: `src/features/dictionary/search.ts` and `SearchPanel.tsx`, on the Lookup page.

## The goal

On the Lookup page, someone types something like `ma`, `nihao`, `xie3` or `write` and gets a short list of candidates. Each candidate shows the character(s), the pinyin and the meaning, so they can pick the word they meant. HSK 1 and HSK 2 words come first, matching the level they've chosen.

## What we already have (no new data needed)

`public/packs/core/dict.json` (2.3 MB, already offline) holds **27,752 CC-CEDICT entries**. Each one has:
- simplified and traditional characters;
- tone-marked pinyin;
- English definitions;
- an HSK level from the official syllabus;
- a "this is the HSK reading" flag.

**696** of those entries are HSK 1–2 words (410 are HSK 1). So the pinyin and English data are already on the device. What's missing is a **search index** and a **search box**.

Spot checks on the current data:

| Typed | HSK 1–2 matches found |
|---|---|
| `shi` | 事 十 时 是 |
| `hao` | 好 号 |
| `xie` | 些 写 |
| `write` | 写 xiě, plus weaker hits 做, 书, 笔, 开 |

## Libraries considered

| Option | What it does | Verdict |
|---|---|---|
| **Our own small index** (recommended) | Precompute a toneless pinyin key and English word list per entry when the dictionary loads. | Enough here. A naive scan of all 27k entries took ~7 ms; with precomputed keys it's well under that. No dependency, no licence question, works offline. |
| `pinyin-pro` (MIT) | Turns Chinese characters into pinyin. | Not needed: CC-CEDICT already gives pinyin for every entry. |
| MiniSearch (MIT) / Fuse.js (Apache-2.0) / FlexSearch | General fuzzy full-text search. | Possible for English typo tolerance (`wirte` → write). They don't understand pinyin, though, and add bundle size. Revisit only if typo tolerance turns out to matter. |

## How matching should work

**Pinyin input.** Accept every way a learner might type it:
- With or without tones: `ma`, `mā`, `ma1`.
- With or without spaces: `ni hao`, `nihao`. Split run-together input using the ~410 valid Mandarin syllables (`xian` can be `xian` or `xi an`; try both).
- ü typed as `v` or `u`: `lv`, `lu:`, `nü`.
- Partial input while typing: `zh` → 中, 这, 住 …
- If they give a tone, filter by it (`ma3` → 马); if not, show all tones grouped.

**English input.**
- Match whole words in the definitions (`write` matches "to write", but not "writer" unless they type more).
- Ignore a leading "to " so `write` and `to write` behave the same.
- Rank an exact gloss ("to write" for 写) above a mention inside a longer gloss ("to write out (a prescription)" for 开).

**Telling the two apart.** Input that is only valid pinyin syllables (and tone numbers) is tried as pinyin first. Everything else is treated as English. Some input is both (`he`, `you`, `ma`, `long`), so show **both** groups, pinyin first.

## Ranking (most important first)

1. Words at the chosen level (HSK 1 or HSK 2), then the other of the two, then HSK 3, then everything else.
2. Within a level, the HSK reading first (写 xiě before xiè).
3. Exact matches before prefix matches before partial matches.
4. Single characters and short words before long words.
5. Hide "variant of …" cross-references and proper-noun entries (书 *Shū*, the classic text) unless nothing else matches.

Show at most ~20 results, with a "show more" option.

## Data problems the research found

These need fixing for search results to be trustworthy:
- **Levels are tagged per word, not per reading.** 写 xiè and 书 *Shū* both show as HSK 1. Ranking by the "HSK reading" flag (rule 2) mostly hides this.
- **Some HSK characters appear only inside words.** 妈 alone has no level, because the syllabus lists 妈妈. Search should give it the level of the HSK word it's part of, so `ma` shows 妈 near the top.
- **CC-CEDICT definitions are terse and sometimes odd** (`CL:個|个[ge4]` lines). The result list should hide `CL:` lines and show only the first 2–3 meanings.

## What each result would show

```
妈  mā   HSK 1 (in 妈妈)   mum; mother
吗  ma   HSK 1             question particle for yes/no questions
马  mǎ   HSK 3             horse
```

Tapping a result opens the existing entry page (strokes, words containing it, and so on).

## Rough size of the build

- `dictionary.ts`: add a search index and a `search(query, level)` function, plus unit tests for the pinyin splitting and the ranking.
- Lookup page: add a text box next to the drawing pad, and a results list.
- Browser tests: pinyin, English, mixed input, offline, phone layout.
- No new data download and no new licence.
