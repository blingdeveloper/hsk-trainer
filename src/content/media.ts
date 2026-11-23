// Register of every photo, picture and recording the app ships (public/media/).
// Each file has exactly one entry here, with where it came from and the licence it is used under.
// Tests check that every file is registered, every entry's file exists, and only approved licences are used.
// To add media: see docs/content-and-sources.md → "Adding photos or recordings".

export type MediaLicence = 'Unsplash License';

export interface LicenceInfo {
  name: MediaLicence;
  url: string;
  /** What the licence allows and forbids, in plain words, as read on `checked`. */
  summary: string;
  checked: string;
}

/** Licences media may use. Anything else fails the tests until it is reviewed and added here. */
export const MEDIA_LICENCES: Record<MediaLicence, LicenceInfo> = {
  'Unsplash License': {
    name: 'Unsplash License',
    url: 'https://unsplash.com/license',
    summary:
      'Free to download, copy, modify, distribute and use, including commercially, without permission or credit. ' +
      'Not allowed: selling images without significant modification, or compiling Unsplash images to replicate a similar or competing service. ' +
      'Unsplash+ (paid) photos are a different licence and are not used.',
    checked: '2026-11-23',
  },
};

export interface MediaItem {
  /** File under public/media/, e.g. "photos/unsplash-wuQEpz6uxSw.jpg". */
  file: string;
  kind: 'photo';
  /** What the picture shows, for screen readers. Never gives away an answer's Chinese. */
  alt: string;
  /** Where it came from: the page it was downloaded from. */
  sourceUrl: string;
  /** Who made it, as credited by the source. */
  author: string;
  authorUrl: string;
  licence: MediaLicence;
  /** Date downloaded (YYYY-MM-DD). */
  downloaded: string;
  /** What we changed from the original. */
  changes: string;
  /** SHA-256 of the file as shipped, so any later change to the file is noticed. */
  sha256: string;
}

const UNSPLASH_CHANGES = 'Cropped to 4:3 and resized to 800×600 JPEG by the Unsplash image service; no other edits.';

export const MEDIA: Record<string, MediaItem> = {
  'unsplash-3KgSopqBgYI': {
    file: 'photos/unsplash-3KgSopqBgYI.jpg',
    kind: 'photo',
    alt: 'A smiling woman talking on a mobile phone',
    sourceUrl: 'https://unsplash.com/photos/a-woman-smiling-while-talking-on-a-cell-phone-3KgSopqBgYI',
    author: 'Vitaly Gariev',
    authorUrl: 'https://unsplash.com/@silverkblack',
    licence: 'Unsplash License',
    downloaded: '2026-11-23',
    changes: UNSPLASH_CHANGES,
    sha256: '7a6431a169fed3a4a40e7f2f388df9196d2e026884db8a9060d9ad918df06cc7',
  },
  'unsplash-otYC4eoGJGg': {
    file: 'photos/unsplash-otYC4eoGJGg.jpg',
    kind: 'photo',
    alt: 'A boy kicking a football on a grass field, with two children behind him',
    sourceUrl: 'https://unsplash.com/photos/children-playing-soccer-on-grass-field-otYC4eoGJGg',
    author: 'Quilia',
    authorUrl: 'https://unsplash.com/@heyquilia',
    licence: 'Unsplash License',
    downloaded: '2026-11-23',
    changes: UNSPLASH_CHANGES,
    sha256: 'd8ee7c403a7057286ae7c404dfdc0cbc395bfcb8eb76a78f5c02e44a301897f2',
  },
  'unsplash-wuQEpz6uxSw': {
    file: 'photos/unsplash-wuQEpz6uxSw.jpg',
    kind: 'photo',
    alt: 'A woman drinking a glass of milk',
    sourceUrl: 'https://unsplash.com/photos/woman-drinking-milk-from-clear-drinking-glass-wuQEpz6uxSw',
    author: 'engin akyurt',
    authorUrl: 'https://unsplash.com/@enginakyurt',
    licence: 'Unsplash License',
    downloaded: '2026-11-23',
    changes: UNSPLASH_CHANGES,
    sha256: '01ee61d6bacea075efc1204328cbb5979fc564e45b2ef7744f90e744ece9b103',
  },
  'unsplash-Co_hWX_XtEk': {
    file: 'photos/unsplash-Co_hWX_XtEk.jpg',
    kind: 'photo',
    alt: 'A tabby cat asleep on a wooden floor',
    sourceUrl: 'https://unsplash.com/photos/gray-and-orange-tabby-cat-on-floor-whitel-sleeping-Co_hWX_XtEk',
    author: 'Ash Edmonds',
    authorUrl: 'https://unsplash.com/@badashphotos',
    licence: 'Unsplash License',
    downloaded: '2026-11-23',
    changes: UNSPLASH_CHANGES,
    sha256: 'ca715d522f02a67980c392d6b21be6995bb7a3b6839838924e0b718dc2110df7',
  },
  'unsplash-KTrov7eujms': {
    file: 'photos/unsplash-KTrov7eujms.jpg',
    kind: 'photo',
    alt: 'A woman cooking in a kitchen, lifting the lid of a pot',
    sourceUrl: 'https://unsplash.com/photos/woman-standing-in-front-of-fruits-holding-pots-lid-KTrov7eujms',
    author: 'Jason Briscoe',
    authorUrl: 'https://unsplash.com/@jsnbrsc',
    licence: 'Unsplash License',
    downloaded: '2026-11-23',
    changes: UNSPLASH_CHANGES,
    sha256: 'df0b00a70b6bb46d5ada92da295423ea756cd735ddc98ae8d63f5d36ffadb9fa',
  },
  'unsplash-yDOzSz7YcYE': {
    file: 'photos/unsplash-yDOzSz7YcYE.jpg',
    kind: 'photo',
    alt: 'People with umbrellas walking on a wet street in the rain, seen from above',
    sourceUrl: 'https://unsplash.com/photos/three-people-using-umbrella-walking-in-the-street-yDOzSz7YcYE',
    author: 'bckfwd',
    authorUrl: 'https://unsplash.com/@bckfwd',
    licence: 'Unsplash License',
    downloaded: '2026-11-23',
    changes: UNSPLASH_CHANGES,
    sha256: 'a3bd2effeccde8487908aae4dbca92152562cf16f1640376ac9ed0958144b0b0',
  },
};

export function mediaUrlPath(id: string): string {
  return `media/${MEDIA[id].file}`;
}
