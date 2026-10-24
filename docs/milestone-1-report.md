# Milestone 1 report: offline prototype and HSK 2 exam sprint

Date: 2026-10-24. Status: **done, awaiting your approval before M2.**

## Official HSK 3.0 Level 2 format (verified)

Source: the official CTI sample paper `HSK（二级）样卷.pdf` with answer key, from the sample ZIP linked on chinesetest.cn/hsk (ZIP dated 2026-09-09).

| Section | Questions | Time | Parts |
|---|---|---|---|
| Listening 听力 | 25 | ~17 min | P1 (1–5): pick the picture (A/B/C). P2 (6–15): match dialogues to pictures A–F. P3 (16–25): short dialogue + question, 3 options |
| Reading 阅读 | 25 | 25 min | P1 (26–30): match sentences to pictures. P2 (31–35): word bank A–F, fill the gap. P3 (36–45): match each sentence to its reply. P4 (46–50): short passage + ★ question, 3 options |
| Writing 书写 | 10 | 10 min | P1 (51–55): choose the missing component to complete a character. P2 (56–60): write the character for the pinyin given in a sentence |

- There are 3 minutes after listening to fill in the answer sheet. The whole exam takes about 60 minutes, including 5 minutes for personal details. Level 2 has no speaking test (the speaking sample papers start at Level 3).
- The sample paper does not give scoring or a pass mark. The app shows raw scores only.
- The official answer key numbers the writing answers 54–63, but the paper numbers them 51–60. This is an error in CTI's own document, and it doesn't affect us.

## What works (tested)

| Feature | Evidence |
|---|---|
| Handwriting pad: touch/mouse/stylus via pointer events, undo, clear | e2e `clear and undo work` |
| On-device recognition (HanziLookupJS in a Web Worker); candidate list | e2e: drawing 十 offers 十 |
| Candidate → dictionary entry: pinyin with tone marks, definitions, traditional form, HSK 3.0 level tag | e2e and unit tests on the real CC-CEDICT pack |
| "Words containing" list shows only dictionary-confirmed words, HSK-listed first | unit test |
| Stroke-order animation from bundled data | e2e |
| Save a character or word (IndexedDB) | unit test (no duplicates) |
| **Everything above with the network OFF** after the first visit | e2e offline tests on desktop and Pixel 7 emulation |
| 25 original HSK 2 practice questions: Reading P2–4 and Writing P1–2 | content tests: answer keys valid, writing answers are from the official 书写字 list, every item labelled `original` |
| Guided mode: check one answer at a time, explanation shown, answer locked | e2e |
| Timed mode: section timers scaled from official timing, no feedback until the end, review screen | e2e |
| Double submission prevented | e2e (double-click doesn't double-save) |
| Attempt history survives a reload, offline | e2e |
| Sources & Licences screen | manual check |

Test results: **30/30 unit tests and 10/10 browser tests pass** (`npm test`, `npm run test:e2e`).

Offline download size: about 5 MB precached (668 files: app, 2.1 MB dictionary, 0.8 MB recogniser data, 654 stroke files).

## Known limitations

1. **No listening practice and no Reading Part 1.** These need audio and pictures. Official sample audio exists but is copyrighted by CTI. We need a licensed or self-made source (see the M2 options).
2. **Practice questions are author-checked, not native-reviewed.** Every word was checked against the HSK 1–2 list (some compounds are made of HSK 1–2 parts), but a native speaker should review them before they're marked "trusted".
3. **Recognition depends on stroke order and count.** Messy or out-of-order strokes can rank the right character lower. There's no pinyin or text search yet (planned for the dictionary explorer).
4. **No audio pronunciation** in the dictionary.
5. **Raw scores only.** CTI hasn't published scaled scores or pass marks for the new HSK 1–6.
6. **Tested in Chromium only** (desktop and Android emulation). Not yet tested on a real Android phone, Safari or Firefox.
7. The browser tests draw with a mouse; real finger input on a touchscreen hasn't been tested yet.
8. The dictionary covers single characters (9.5k) and words made of HSK 1–3 characters (27.6k entries in total). Words outside that range show "not in offline pack".
9. **Copyright of the HSK level tags.** They come from CTI's syllabus, which has no open licence. They're cited, and the syllabus itself is not redistributed. Ask CTI before a public release.
10. Not deployed yet. It runs locally only.

## Proposed M2 (your exam is about 7 weeks away)

1. More original practice in the official format: about 3 full Reading and Writing sets (75 questions), with spaced review of mistakes.
2. A **writing-character trainer** for all 100 official HSK 1–2 writing characters (书写字), using Hanzi Writer quizzes.
3. Listening: either (a) use the device's text-to-speech, clearly labelled and with quality varying by device, or (b) record or license audio. Picture-based questions need licensed or self-made images.
4. Deploy to GitHub Pages so it installs on your phone.
