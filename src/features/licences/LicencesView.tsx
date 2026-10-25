import PageHeader from '../../ui/PageHeader';
import { assetUrl } from '../../lib/assets';

const SOURCES = [
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
    use: 'Stroke-order animation',
    url: 'https://hanziwriter.org/',
    licence: 'MIT',
    licenceUrl: 'https://github.com/chanind/hanzi-writer/blob/master/LICENSE',
    notes: '',
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
    name: 'HSK 考试大纲 (Chinese Testing International, published 2025-11, effective 2026-07)',
    use: 'HSK 3.0 level tags and the HSK 1–2 writing-character list',
    url: 'https://www.chinesetest.cn/hsk',
    licence: 'Copyright CTI. No open licence.',
    licenceUrl: '',
    notes: 'Used only for level tags and character lists, with this citation. The syllabus document is not redistributed. Check with CTI before any public release.',
  },
  {
    name: 'HSK（二级）样卷 (CTI official sample paper, 2026)',
    use: 'Reference for the exam format only (sections, question counts, timing, task types)',
    url: 'https://www.chinesetest.cn/hsk',
    licence: 'Copyright CTI',
    licenceUrl: '',
    notes: 'No official questions are included in this app. All practice questions are original.',
  },
];

export default function LicencesView() {
  return (
    <div className="space-y-4">
      <PageHeader han="来源 · láiyuán" title="Sources & Licences">
        <p className="text-sm text-muted">
          This app is free software under the GNU GPL v3 or later. Practice questions marked "Original practice" were written for this app.
          They are not official HSK questions.
        </p>
      </PageHeader>
      <ul className="grid gap-3 md:grid-cols-2">
        {SOURCES.map((s) => (
          <li key={s.name} className="card text-sm">
            <h2 className="font-display text-base font-semibold">{s.name}</h2>
            <p className="mt-1">{s.use}</p>
            <p className="mt-1">
              Licence: {s.licenceUrl ? <a className="text-rose underline" href={s.licenceUrl}>{s.licence}</a> : s.licence}
            </p>
            <p className="mt-1">
              Source:{' '}
              <a className="text-rose underline break-all" href={s.url}>
                {s.url}
              </a>
            </p>
            {s.notes && <p className="mt-1 text-muted">{s.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
