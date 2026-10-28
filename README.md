# HSK Sentence & Exam Trainer

A free app for HSK 3.0 Level 2 that works offline. It installs from the browser as a Progressive Web App (PWA). It has exam practice in the official format, plus a dictionary you search by drawing a character.

Licence: GPL-3.0-or-later (see `LICENSE`). Third-party data is listed in the app under **Sources** and in `src/features/licences/LicencesView.tsx`.

## First-time setup (macOS)

You need Node.js 20 or newer (`node --version`) and `pdftotext`, which is used only by the data build script. Install them with:

```bash
brew install node poppler
```

Then, in this folder:

```bash
cd "/Users/akwesirobot/Desktop/HSK app"
npm install
npm run fetch:data      # downloads CC-CEDICT, HanziLookupJS and the HSK syllabus into data-raw/
npm run build:data      # builds public/packs/ and public/vendor/ from data-raw/
npx playwright install chromium   # only needed for the browser tests
```

## Everyday commands

| What | Command |
|---|---|
| Run the app while developing (http://localhost:5173) | `npm run dev` |
| Production build | `npm run build` |
| Serve the production build, offline mode included (http://localhost:4173) | `npm run preview` |
| Unit tests | `npm test` |
| Browser tests, including offline tests | `npm run test:e2e` |
| Browser tests under a GitHub Pages sub-path | `BASE=/hsk-trainer/ npm run test:e2e` |

Offline mode only works in the **production build** (`npm run build && npm run preview`), not in `npm run dev`. Open the app once while online and wait for "✓ Ready offline" on the Home screen. After that it works without internet.

## Where things are

| Path | What it is |
|---|---|
| `src/features/handwriting/` | Drawing pad and a Web Worker wrapper around the recogniser |
| `public/workers/recognise-worker.js` | Runs HanziLookupJS off the main thread |
| `src/features/dictionary/` | Dictionary loader, index and entry page |
| `src/features/strokes/` | Stroke-order animation (Hanzi Writer) |
| `src/features/exam/` | Practice/exam engine and scoring |
| `src/content/sets/` | **Original** practice sets A–C, labelled as such |
| `src/content/types.ts` | Question types and official HSK 2 timing |
| `src/features/characters/` | Writing trainer for the 100 HSK 1–2 writing characters |
| `.github/workflows/deploy.yml` | Builds, tests and publishes to GitHub Pages (manual for now) |
| `src/db/db.ts` | IndexedDB storage (attempts, saved items, settings, exam in progress) |
| `src/db/backup.ts` | Backup export, checks and restore |
| `src/features/settings/` | Settings screen (exam date, pinyin, backup, storage) |
| `scripts/build-data/` | Download and build scripts for the data packs |
| `docs/` | Phase 0 proposal and milestone reports |

## Deploying to GitHub Pages

The code lives in the private repository `blingdeveloper/hsk-trainer`. Free GitHub Pages needs a **public** repository, so publishing is switched off for now. To publish later:

1. Make the repository public (check the licence note for the HSK syllabus data first: see Sources & Licences in the app).
2. On GitHub, open the repository's **Settings → Pages** and set **Source** to **GitHub Actions**.
3. In `.github/workflows/deploy.yml`, add the `push: branches: [main]` trigger back. Every push to `main` then runs the tests and publishes to `https://blingdeveloper.github.io/hsk-trainer/`.
4. On Android: open that link in Chrome, wait for "✓ Ready offline", then use **⋮ → Add to Home screen**.

## Your data

Progress lives only in the browser on each device. Use **Settings → Save backup file** now and then, and **Restore from file…** on a new device or after clearing browser data.
