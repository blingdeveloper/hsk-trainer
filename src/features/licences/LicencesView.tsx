import PageHeader from '../../ui/PageHeader';
import { assetUrl } from '../../lib/assets';
import { SOURCES } from '../../content/sources';
import { MEDIA, MEDIA_LICENCES, mediaUrlPath } from '../../content/media';

export default function LicencesView() {
  const media = Object.entries(MEDIA);
  return (
    <div className="space-y-6">
      <PageHeader han="来源 · láiyuán" title="Sources & Licences">
        <p className="text-sm text-muted">
          This app is free software under the GNU GPL v3 or later. Practice questions marked "Original practice" were written for this app.
          They are not official HSK questions.
        </p>
      </PageHeader>
      <ul className="grid gap-3 md:grid-cols-2" data-testid="sources">
        {SOURCES.map((s) => (
          <li key={s.name} className="card text-sm">
            <h2 className="font-display text-base font-semibold">{s.name}</h2>
            <p className="mt-1">{s.use}</p>
            <p className="mt-1">
              Licence: {s.licenceUrl ? <a className="text-rose underline" href={s.licenceUrl}>{s.licence}</a> : s.licence}
            </p>
            <p className="mt-1">
              Source:{' '}
              <a className="break-all text-rose underline" href={s.url}>
                {s.url}
              </a>
            </p>
            {s.notes && <p className="mt-1 text-muted">{s.notes}</p>}
          </li>
        ))}
      </ul>

      {media.length > 0 && (
        <section className="card space-y-3" aria-labelledby="photo-credits">
          <h2 id="photo-credits" className="font-display text-lg font-semibold">
            Photo credits
          </h2>
          <ul className="grid gap-4 md:grid-cols-2" data-testid="photo-credits">
            {media.map(([id, m]) => (
              <li key={id} className="flex gap-3 text-sm">
                <img src={assetUrl(mediaUrlPath(id))} alt={m.alt} loading="lazy" className="aspect-[4/3] w-24 shrink-0 self-start rounded-lg object-cover" />
                <div className="min-w-0 space-y-1">
                  <p>
                    Photo by{' '}
                    <a className="text-rose underline" href={m.authorUrl}>
                      {m.author}
                    </a>{' '}
                    on{' '}
                    <a className="text-rose underline" href={m.sourceUrl}>
                      Unsplash
                    </a>
                  </p>
                  <p className="text-xs text-muted">
                    <a className="underline" href={MEDIA_LICENCES[m.licence].url}>
                      {m.licence}
                    </a>{' '}
                    · downloaded {m.downloaded} · {m.changes}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
