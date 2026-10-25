# Playbook: adding a level (next: HSK 1)

Goal: add **HSK 1** to the same app, with everything HSK 2 has (practice sets, mock exams, mistake notebook, Today screen, handwriting dictionary, Settings, backup), built the same way and to the same quality bar. You pick the level in Settings, and each level's progress is kept apart.

## 1. How HSK 2 was built (repeat these steps)

1. **Verify the official format first.** Read CTI's sample paper and answer key (sample ZIP linked from chinesetest.cn/hsk; HSK 3.0 papers dated 2026). Never trust third-party summaries for question counts, timing or part order.
2. **Use the official syllabus for language limits.** `scripts/build-data/build-all.mjs` parses the 2025-11 syllabus PDF for word levels, syllabus pinyin, reading characters per level and the writing-character list. Re-run with `npm run fetch:data && npm run build:data`.
3. **Write original questions only**, labelled `sourceType: 'original'`, in the official task types. Never copy official sample questions.
4. **Guard content with tests**, not just review:
   - paper shape (questions per part, one unused distractor per shared option list);
   - every answer key points at a real option;
   - only characters from the level's lists (names and radicals allowlisted);
   - writing answers from the official 书写字 list;
   - **every pinyin syllable matches CC-CEDICT** (`tests/unit/pinyin-content.test.ts`; only 一/不 sandhi and neutral tones may differ);
   - no repeated questions across sets.
5. **Review every question by hand** for: more than one valid answer (word banks and reply matching are where this happened), unnatural Chinese (e.g. praising a Chinese person's Chinese), and explanations that misstate grammar.
6. **Wire into the engine** (papers → runner → views). Test in a real browser: full mock sittings answered correctly (must score 100%), sittings with wrong and blank answers (score and notebook counts exact), timer expiry in every section, resume after reload, offline.
7. **QA sweep**: every route with zero console errors (`tests/e2e/no-errors.spec.ts`); check desktop, 375 px and 320 px, and light and dark mode.
8. **Record it**: update `docs/audit-2026-10-24.md` (or a new audit), commit per milestone, then report what works and what's limited.

## 2. HSK 1 official format (verified from CTI sample paper `HSK（一级）样卷.pdf`)

| Section | Questions | Time | Parts (task) |
|---|---|---|---|
| Listening 听力 | 20 | ~12 min (+3 min answer sheet) | P1 (1–5) picture A/B/C · P2 (6–10) hear a question, choose the reply (3 options) · P3 (11–15) match dialogues to pictures · P4 (16–20) short passage + question (3 options) |
| Reading 阅读 | 20 | 20 min | P1 (21–25) match sentences to pictures · **P2 (26–30) match each question to its reply (A–F)** · **P3 (31–35) word bank fill-in (A–F)** · **P4 (36–40) short passage + ★ question (3 options)** |
| Writing | **none** | | |

- Total about 40 minutes (including 5 min for personal details). The paper prints pinyin above the Chinese. No scaled scores or pass mark published.
- **Reuse:** Reading P2 = our `reading-3-response-match` (one group of 5), P3 = `reading-2-word-bank`, P4 = `reading-4-short-passage`. Same task types as HSK 2, **different part numbers and order**.
- Vocabulary: HSK 1 = 300 words; reading characters L1 = 245 (both already parsed by the data build).
- The 书写字 list in the syllabus covers **levels 1–2 together** (100 characters), so it can't be split into an HSK 1 list. The Characters trainer can stay shared, with a note.

## 3. Where the app assumes HSK 2 today (what to change)

| Area | File(s) | Change |
|---|---|---|
| Level config | *new* `src/content/levels.ts` | One object per level: id, name, official sections and timing, part labels per task type, part order, mock layout, allowed character set, whether writing exists. Everything below reads from it. |
| Question types | `src/content/types.ts` | `level: 2` → `level: 1 \| 2`; `OFFICIAL_SECTIONS` moves into the level config. `officialPart` comes from the level, not the group. |
| Content | `src/content/sets/` | New `hsk1/set-a.ts…` with ids prefixed `h1-` (ids must stay unique across levels; HSK 2 ids stay as they are so existing progress keeps working). |
| Papers and mocks | `src/features/exam/papers.ts` | Papers per level; `buildMock` uses the level's layout (HSK 1: Reading P2, P3, P4 = 15 questions, no writing section). |
| Engine | `ExamRunner.tsx`, `QuestionViews.tsx` | Already handles papers with only a reading section (mistake papers do). Section labels and part names come from the level. |
| Progress per level | `db.ts`, `mistakes.ts`, `HomeView.tsx`, `ExamView.tsx` | Filter attempts, mistakes, history and "Up next" by the current level (paper ids carry the level). |
| Settings | `SettingsView.tsx`, `UserSettings.targetLevel` | Level picker (HSK 1 / HSK 2); exam date stays per person. |
| Labels | `App.tsx`, `HomeView.tsx`, `SettingsView.tsx`, `LicencesView.tsx`, `CharactersView.tsx` | "HSK 2" text comes from the level. |
| Tests | `tests/unit/content.test.ts`, `papers.test.ts`, e2e specs | Run the content checks per level with that level's character set and shape; mock-exam e2e for HSK 1 papers; HSK 2 tests unchanged. |
| Data build | `build-all.mjs` | No change needed: L1 lists and the dictionary (HSK 1–3 characters) are already built. |

## 4. Lessons learned (avoid repeating these)

- Word banks and reply lists easily allow **two valid answers**. Check each blank against every option, not just the intended one.
- Explanations must be grammatically exact (在 "at" vs. progressive 在; 呢 marks ongoing action).
- CC-CEDICT lists proper nouns and "variant of" entries first for some characters. The build marks the syllabus reading (`hskReading`), and the dictionary orders by it.
- Tailwind v4: a custom class can't `@apply` another custom class; use `@utility`.
- The desktop app's browser pane blocks service workers. Test offline behaviour with Playwright (Chromium), not the pane.
- Port 5173 may be taken by other projects; this app uses 4173 (preview/tests) and 4180 (dev).
- Exam state saves every second in timed mode; IndexedDB writes during page unload aren't reliable.
- Prove every new checker catches a deliberate mistake before trusting a pass.
- Ask before: choosing a listening approach, publishing/deploying (CTI's syllabus data has no open licence), anything outward-facing.
