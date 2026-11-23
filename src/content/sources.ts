// Every outside source the app uses or ships, with its licence. Shown on the Sources & Licences screen.
// Tests check that every package shipped to users is listed here under an approved licence,
// and that every photo or recording is registered in ./media.ts.
import { assetUrl } from '../lib/assets';

export interface Source {
  name: string;
  use: string;
  url: string;
  licence: string;
  licenceUrl: string;
  notes: string;
  /** npm packages this entry covers (shipped to users). */
  packages?: string[];
}

/** Licences approved for code and fonts shipped to users (SPDX ids, as in package-lock.json). */
export const APPROVED_PACKAGE_LICENCES = ['MIT', 'Apache-2.0', 'OFL-1.1', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause'];

/** Build-time packages whose code is copied into the app (the offline service worker). */
export const SHIPPED_BUILD_PACKAGES = ['workbox-window', 'workbox-core', 'workbox-precaching', 'workbox-routing'];

export const SOURCES: Source[] = [
  {
    name: 'CC-CEDICT',
    use: 'Chinese–English definitions and pinyin (subset: single characters plus words made of HSK 1–3 characters)',
    url: 'https://cc-cedict.org/',
    licence: 'Creative Commons Attribution-ShareAlike 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    notes: 'Changes: converted to tone-marked pinyin and filtered. The derived file packs/core/dict.json is shared under CC BY-SA 4.0.',
  },
  {
    name: 'HanziLookupJS (Gábor Ugray), based on HanziLookup (Jordan Kiang)',
    use: 'Offline handwriting recognition: code and recognition data (mmah.json)',
    url: 'https://github.com/gugray/HanziLookupJS',
    licence: 'GNU GPL (code); Arphic Public License (mmah.json)',
    licenceUrl: assetUrl('vendor/hanzilookup/LICENSE-APL.txt'),
    notes: 'Pinned to commit b21124f. Because this app includes GPL code, the app itself is licensed GPL-3.0-or-later.',
  },
  {
    name: 'Hanzi Writer (David Chanin)',
    use: 'Stroke-order animation and writing quizzes',
    url: 'https://hanziwriter.org/',
    licence: 'MIT',
    licenceUrl: 'https://github.com/chanind/hanzi-writer/blob/master/LICENSE',
    notes: '',
    packages: ['hanzi-writer'],
  },
  {
    name: 'hanzi-writer-data / Make Me a Hanzi (Shaunak Kishore), from Arphic fonts',
    use: 'Stroke shapes and order for HSK 1–3 characters',
    url: 'https://github.com/skishore/makemeahanzi',
    licence: 'Arphic Public License',
    licenceUrl: assetUrl('vendor/hanzilookup/LICENSE-APL.txt'),
    notes: '',
  },
  {
    name: 'Photos from Unsplash',
    use: 'Pictures for Reading Part 1 questions. Each photo, its photographer and its source page are listed below.',
    url: 'https://unsplash.com/',
    licence: 'Unsplash License',
    licenceUrl: 'https://unsplash.com/license',
    notes: 'Free to use, including commercially, without permission. Only free photos are used, never paid Unsplash+ ones.',
  },
  {
    name: 'Inter and Fraunces typefaces',
    use: 'Fonts for English text and headings',
    url: 'https://fontsource.org/',
    licence: 'SIL Open Font License 1.1',
    licenceUrl: 'https://openfontlicense.org/',
    notes: 'Inter by Rasmus Andersson and the Inter Project Authors; Fraunces by Undercase Type. Bundled with the app.',
    packages: ['@fontsource-variable/inter', '@fontsource-variable/fraunces'],
  },
  {
    name: 'React',
    use: 'User interface library',
    url: 'https://react.dev/',
    licence: 'MIT',
    licenceUrl: 'https://github.com/facebook/react/blob/main/LICENSE',
    notes: '',
    packages: ['react', 'react-dom', 'scheduler'],
  },
  {
    name: 'Dexie.js',
    use: 'Saving progress on this device (IndexedDB)',
    url: 'https://dexie.org/',
    licence: 'Apache License 2.0',
    licenceUrl: 'https://github.com/dexie/Dexie.js/blob/master/LICENSE',
    notes: '',
    packages: ['dexie'],
  },
  {
    name: 'Workbox (Google)',
    use: 'Offline use and the "new version ready" banner',
    url: 'https://developer.chrome.com/docs/workbox',
    licence: 'MIT',
    licenceUrl: 'https://github.com/GoogleChrome/workbox/blob/v7/LICENSE',
    notes: 'Added to the app by vite-plugin-pwa when it is built.',
    packages: SHIPPED_BUILD_PACKAGES,
  },
  {
    name: 'HSK 考试大纲 (Chinese Testing International, published 2025-11, effective 2026-07)',
    use: 'HSK 3.0 level tags, the HSK 1–2 writing-character list, and which reading of a character to show first',
    url: 'https://www.chinesetest.cn/hsk',
    licence: 'Copyright CTI. No open licence.',
    licenceUrl: '',
    notes: 'Used only for level tags and character lists, with this citation. The syllabus document is not redistributed.',
  },
  {
    name: 'HSK（一级）and HSK（二级）样卷 (CTI official sample papers, 2026)',
    use: 'Reference for the exam format only (sections, question counts, timing, task types)',
    url: 'https://www.chinesetest.cn/hsk',
    licence: 'Copyright CTI',
    licenceUrl: '',
    notes: 'No official questions, pictures or recordings are included in this app. All practice questions are original.',
  },
];
