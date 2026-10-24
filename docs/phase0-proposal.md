# Phase 0 — Foundations proposal

Status: **approved 2026-10-24.** The exam format in §2 has since been verified from the official sample paper (see `milestone-1-report.md`).
Checked: 2026-10-24.

## 1. Your target

| | |
|---|---|
| Level | HSK 2 (HSK 3.0, Band 2) |
| Sitting | 13 Dec 2026, reported as the first worldwide HSK 3.0 sitting (secondary sources; confirm with your test centre) |
| Registration | Paper-based reportedly closes 16 Nov 2026 and computer-based on 3 Dec. Check your centre. |

## 2. Exam format: what's verified and what isn't

**Verified from the official syllabus** (中文水平考试 HSK 考试大纲, published 2025-11, in effect 2026-07, linked from chinesetest.cn/hsk):
- HSK 3.0 Level 2 has its own task list (任务大纲), topic list (话题大纲), vocabulary list (词汇大纲), reading characters (认读字), grammar list (语法大纲) and a shared Level 1–2 **writing-character list (书写字, about 100 characters)**. So character writing is part of what Level 2 tests, at least at the syllabus level.

**Not yet verified:** section structure, number of questions, timing and scoring.
- Third-party summaries say about 60 questions and about 60 minutes, covering listening, reading and possibly writing, with no speaking at Level 2. They disagree on the details.
- Pass marks for the new HSK 1–6 have reportedly not been published yet.
- The official answer is in CTI's **sample-paper ZIP**. It is 395 MB, last modified 2026-09-09, at `hsk-sample-1409982902.cos.ap-beijing.myqcloud.com/HSK3.0.zip`. **I need your OK to download it** to a temporary folder. I would only read the Level 2 paper and would not redistribute anything.
- Until then, every exam task type in the app is marked `formatVerified: false`.

## 3. Licence check (repositories inspected 2026-10-24)

| Component | Use | Licence | Verdict |
|---|---|---|---|
| **HanziLookupJS** (github.com/gugray/HanziLookupJS) | Offline handwriting recognition: a 12 KB library plus `mmah.json` (827 KB) | Code and `orig.json`: GNU GPL. `mmah.json`: Arphic Public License | ✅ Use it. Plain JS that runs in the browser with no server. Unchanged since 2019, but the algorithm is stable. **This makes the app GPL-licensed.** That's fine for a free app, but the source has to be published. |
| hanzi_lookup (Rust/WebAssembly) | Alternative recogniser | LGPL-3.0 | Fallback only. Needs a Rust toolchain, which is harder for a beginner to maintain. |
| **Hanzi Writer** 3.7.3 | Stroke-order animation and writing quizzes | MIT | ✅ Actively maintained and can load data locally. |
| **hanzi-writer-data** 2.0.1 | Stroke data | Arphic Public License | ✅ The full set is 32 MB, so we'd bundle only HSK 1–2 characters (well under 1 MB). |
| **Make Me a Hanzi** | Radicals, components, decomposition | `dictionary.txt`: LGPL-3.0+. `graphics.txt`: Arphic | ✅ For Phase 2. |
| **CC-CEDICT** | Chinese–English definitions and pinyin | CC BY-SA 4.0 | ✅ Needs attribution, and our derived subset must also be shared under CC BY-SA. |
| **Official HSK syllabus word lists** | Level tags | CTI copyright; no open licence found | ⚠️ Risk. We'd use the word list only to tag entries "HSK 3.0 L2" and cite the source. We would not republish the document or its example sentences. If the app is ever made public, confirm with CTI first. |

There's no licensed source yet for audio or example sentences. Phase 1 will have no bundled audio. The browser's built-in speech voice (if your device has one) can be an optional extra, marked "device TTS, not a recording". The Tatoeba project (CC BY 2.0 FR) is the candidate source for example sentences in Phase 2.

## 4. Architecture

The spec suggests Next.js. **I recommend Vite + React instead** for this app, because it's fully static and has no server code. That makes it simpler for a beginner, it deploys straight to GitHub Pages, and `vite-plugin-pwa` gives a tested service worker. I'll switch to Next.js if you'd rather follow the spec exactly.

| Layer | Choice |
|---|---|
| UI | React 18 + TypeScript + Tailwind CSS |
| Build/PWA | Vite + vite-plugin-pwa (Workbox precaching) |
| Local data | IndexedDB via Dexie |
| Handwriting | HanziLookupJS, run in a Web Worker so drawing stays smooth |
| Stroke order | Hanzi Writer with locally bundled character JSON |
| Tests | Vitest for unit tests; Playwright for end-to-end tests, including an **offline test** (`context.setOffline(true)`) |
| Hosting | GitHub Pages (free and static) |
| Sync | None yet. Supabase stays optional for later. |

```
HSK app/
  docs/                    proposals, milestone reports
  scripts/build-data/      Node scripts: raw datasets → small JSON content packs
  data-raw/                downloaded source datasets (git-ignored)
  public/packs/            built content packs (JSON + LICENCE notices)
  src/
    db/                    Dexie schema and repositories
    features/handwriting/  canvas, worker, candidate list
    features/dictionary/   entry view, word list
    features/exam/         question renderer, timer, scoring
    features/licences/     Sources & Licences screen
    lib/                   pinyin tone marks, shared types
  tests/                   unit + e2e
```

## 5. Data model (Milestone 1 subset of the spec's §7)

Every record carries `source`, `licence` and `version`. Exam content also carries `syllabusVersion: "HSK3.0-2025-11"` and `sourceType: "official" | "licensed" | "original"`.

- `DictionaryEntry { id, simplified, traditional, pinyin, pinyinNumbered, definitions[], hskLevel?, source, licence, version }`
- `CharacterInfo { character, strokeCount?, strokeDataRef, inWritingList: boolean, source, licence }`
- `Question { id, syllabusVersion, level, skill, taskType, prompt, options?, correctAnswer, explanation, sourceType, formatVerified, validated }`
- `StudyAttempt { id, questionId, answer, correct, timestamp, elapsedMs }`
- `ContentPack { id, version, packType, sizeBytes, checksum, licenceNotices, downloadState }`
- `UserSettings { targetLevel: 2, syllabusVersion, examDate: "2026-12-13", … }`

## 6. Offline storage estimate (Milestone 1)

| Item | Size (approx.) |
|---|---|
| App shell (JS/CSS) | ~300 KB |
| HanziLookupJS + mmah.json | ~840 KB |
| CC-CEDICT subset (entries made only of HSK 1–3 characters, about 5–8k entries) | ~1 MB |
| Stroke data for HSK 1–2 characters | ~0.5 MB |
| Practice question pack | <100 KB |
| **Total** | **≈ 3 MB**, which fits any phone. The full CC-CEDICT (~4 MB gzipped) can be an optional pack later. |

## 7. Milestones

**M1: offline prototype and exam sprint (the next step, about 1–2 sessions)**
1. Project setup, PWA shell, Dexie database, Sources & Licences screen.
2. Handwriting pad (touch, mouse and stylus; clear and undo) → local candidates → dictionary entry (pinyin with tone marks, definitions, words containing the character) → stroke-order animation.
3. Exam sprint: an HSK 2 practice set of about 20 *original* reading questions using Level 2 vocabulary, each labelled **"Original practice — not official, format unverified"**. Untimed and timed modes, scoring, review screen, and attempts saved to IndexedDB.
4. Tests: unit tests (pinyin conversion, dictionary lookup, scoring, double-submit guard) and Playwright end-to-end tests (draw a character → candidate → entry; repeat with the network **offline**; progress survives a reload).

**M2:** Once the official sample paper is checked, real HSK 2 task types and timing, plus listening tasks if audio can be licensed.
**M3:** Dictionary explorer (search, components, example sentences) and content-pack manager.
**M4:** Sentence Lab. **M5:** Mistake notebook, spaced review and progress dashboard. **M6:** Hardening and GitHub Pages deploy.

Because your exam is about 7 weeks away, M2 comes before the dictionary explorer.

## 8. Risks

1. The official format isn't verified yet (see §2). Mitigation: the sample-paper download and the `formatVerified` flag.
2. Copyright status of the CTI word list (see §3).
3. GPL obligation from HanziLookupJS: the app's source must be open.
4. Recognition quality for messy or out-of-order strokes is limited, because HanziLookup is stroke-based. We always show several candidates, and in Phase 2 a pinyin search as fallback.
5. No licensed listening audio yet, so listening practice waits until M2.

## 9. Setup you'll need (I'll run these once you approve)

Already on your Mac: Node v22.22.0, npm 10.9.4, Homebrew and git. Nothing else needs installing before M1.
