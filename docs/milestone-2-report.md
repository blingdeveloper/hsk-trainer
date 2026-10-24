# Milestone 2 report: more practice, writing trainer, deploy setup

Date: 2026-10-24. Status: **built and tested locally. Not deployed yet; that needs your go-ahead (see "Decisions needed").**

## What's new

| Feature | Details | Evidence |
|---|---|---|
| **3 practice sets (75 original questions)** | Sets A, B and C each follow the official paper's Reading Parts 2–4 and Writing Parts 1–2: 15 reading and 10 writing questions. You choose a set on the Practice screen, and history shows which set each attempt used. | Content tests run on every set |
| **Automatic level check** | A test fails if any question or option uses a character outside the official HSK 1–2 character lists. Exceptions: names (王, 李, 北京) and the radicals offered as Writing Part 1 answers. It caught 6 above-level words (不用, 难, 西瓜, 不行, 才, 公园), which I replaced. | `tests/unit/content.test.ts` |
| Other content checks | Each set has the paper's shape (5 per part). Every answer key is valid. Each shared option list has one unused distractor. Writing answers are from the official 书写字 list. No question is repeated across sets. | same |
| **Writing trainer for all 100 书写字** | Grid of all 100 characters with new/practising/learned status. Each character has pinyin and meaning, plus three modes: **Watch** (animation), **Trace** (write over an outline), **From memory** (no outline; hint after 3 misses on a stroke). "Practise next 10" sessions pick unlearned characters, weakest first. | e2e: draw 一 in trace and memory mode, so the status becomes learned; works **offline** and survives a reload |
| Learning rule | A character counts as learned after **2 from-memory writes with ≤ 1 mistake**. Trace attempts are recorded but don't count. | unit tests |
| **GitHub Pages deploy setup** | `.github/workflows/deploy.yml` runs the unit tests, builds under `/<repo>/`, and publishes on every push to `main`. | Full e2e suite also passes under `/hsk-trainer/` (`BASE=/hsk-trainer/ npm run test:e2e`) |

Tests: **57/57 unit tests and 18/18 browser tests pass** (desktop Chrome and Pixel 7 emulation).

## Known limitations

1. Still no listening practice or Reading Part 1. That needs your decision on audio and pictures.
2. The 75 questions are author-checked and level-checked by script, but **not reviewed by a native speaker**.
3. The writing trainer grades stroke shape and order using Hanzi Writer's default leniency. In tests it only drew 一 with a mouse; real finger input on a phone is untested.
4. The pass mark for the new HSK 2 isn't published, so scores stay raw.
5. Tested in Chromium only.

## Decisions needed

1. **Deploy (public).** Free GitHub Pages needs a *public* repository. That would publish:
   - the code (fine: it's GPL and meant to be open);
   - CC-CEDICT, HanziLookupJS and Hanzi Writer data (fine: their licences allow it, with attribution);
   - **HSK level tags and the 100-character list, which come from CTI's syllabus.** It has no open licence. This is the risk flagged in Phase 0. Options: (a) publish with citation and accept the risk; (b) publish without level tags, so the trainer would need its own list; (c) keep it private and use it only from your Mac or phone on the same network.
2. **Listening approach.** You asked me to check with you first. See the options in my message.
