import { useEffect, useRef, useState } from 'react';
import { backupFileName, BackupError, exportBackup, parseBackup, restoreBackup, summariseBackup, type Backup } from '../../db/backup';
import { href } from '../../lib/router';
import { useSettings } from '../../lib/useSettings';
import PageHeader from '../../ui/PageHeader';
import Switch from '../../ui/Switch';
import { daysUntil } from '../home/HomeView';

export default function SettingsView() {
  const [settings, update] = useSettings();
  const today = new Date().toISOString().slice(0, 10);
  const days = settings.examDate ? daysUntil(settings.examDate) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader han="设置 · shèzhì" title="Settings" />

      <section className="card space-y-4" aria-labelledby="exam-settings">
        <h2 id="exam-settings" className="font-display text-xl font-semibold">
          Your exam
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <label className="space-y-1">
            <span className="block text-sm font-medium">Exam date</span>
            <input
              type="date"
              className="min-h-11 rounded-2xl border border-line bg-card px-4 text-ink"
              value={settings.examDate ?? ''}
              min={today}
              onChange={(e) => update({ examDate: e.target.value || undefined })}
              data-testid="exam-date"
            />
          </label>
          <p className="pb-2 text-sm text-muted" data-testid="exam-countdown">
            {days === undefined ? 'No date set.' : days < 0 ? 'This date has passed.' : `${days} day${days === 1 ? '' : 's'} to go.`}
          </p>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-paper p-3">
            <dt className="text-muted">Level</dt>
            <dd className="font-medium">HSK 2</dd>
          </div>
          <div className="rounded-2xl bg-paper p-3">
            <dt className="text-muted">Syllabus</dt>
            <dd className="font-medium">HSK 3.0 (2025-11, in use from July 2026)</dd>
          </div>
        </dl>
        <p className="text-xs text-muted">Only HSK 2 practice content exists so far, so the level can't be changed yet.</p>
      </section>

      <section className="card space-y-3" aria-labelledby="study-settings">
        <h2 id="study-settings" className="font-display text-xl font-semibold">
          Study
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Show pinyin in exam questions</p>
            <p className="text-sm text-muted">The real HSK 2 paper prints pinyin. Turn it off to practise reading characters alone.</p>
          </div>
          <Switch checked={settings.showPinyin} onChange={(v) => update({ showPinyin: v })} label="Pinyin" />
        </div>
      </section>

      <BackupSection />
      <StorageSection />

      <a href={href({ name: 'licences' })} className="card-link flex items-center gap-4">
        <span className="han flex h-12 w-12 items-center justify-center rounded-2xl bg-blush text-lg text-rose" lang="zh-CN" aria-hidden>
          源
        </span>
        <span>
          <span className="block font-medium">Sources &amp; Licences →</span>
          <span className="text-sm text-muted">Where the dictionary, handwriting and stroke data come from.</span>
        </span>
      </a>
    </div>
  );
}

type ImportState =
  | { kind: 'idle' }
  | { kind: 'review'; backup: Backup; fileName: string }
  | { kind: 'done'; message: string }
  | { kind: 'error'; message: string };

function BackupSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState>({ kind: 'idle' });
  const [exported, setExported] = useState(false);

  async function download() {
    const backup = await exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 1)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  }

  async function choose(file: File | undefined) {
    if (!file) return;
    try {
      setState({ kind: 'review', backup: parseBackup(await file.text()), fileName: file.name });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof BackupError ? err.message : "That file couldn't be read." });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function restore(backup: Backup) {
    try {
      await restoreBackup(backup);
      setState({ kind: 'done', message: 'Progress restored from the backup.' });
    } catch {
      setState({ kind: 'error', message: 'Restoring failed. Nothing was changed.' });
    }
  }

  return (
    <section className="card space-y-4" aria-labelledby="backup">
      <div>
        <h2 id="backup" className="font-display text-xl font-semibold">
          Backup &amp; restore
        </h2>
        <p className="mt-1 text-sm text-muted">
          Your progress is stored only in this browser. Clearing browser data or switching device loses it, so save a backup file now and
          then.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={download} data-testid="export">
          ↓ Save backup file
        </button>
        <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
          ↑ Restore from file…
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Backup file" onChange={(e) => choose(e.target.files?.[0])} data-testid="import-file" />
      </div>
      {exported && <p className="text-sm text-good">✓ Backup saved to your downloads.</p>}

      {state.kind === 'review' && (
        <div className="space-y-3 rounded-2xl bg-blush p-4" role="alertdialog" aria-label="Restore backup">
          <p className="text-sm">
            <strong>{state.fileName}</strong>
            {state.backup.exportedAt && <> · saved {new Date(state.backup.exportedAt).toLocaleString()}</>}
          </p>
          <BackupSummary backup={state.backup} />
          <p className="text-sm font-medium">Restoring replaces all progress in this browser with the backup.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => setState({ kind: 'idle' })}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={() => restore(state.backup)} data-testid="confirm-restore">
              Replace and restore
            </button>
          </div>
        </div>
      )}
      {state.kind === 'done' && (
        <p className="text-sm text-good" role="status" data-testid="restore-done">
          ✓ {state.message}
        </p>
      )}
      {state.kind === 'error' && (
        <p className="text-sm text-bad" role="alert" data-testid="restore-error">
          {state.message}
        </p>
      )}
    </section>
  );
}

function BackupSummary({ backup }: { backup: Backup }) {
  const s = summariseBackup(backup);
  return (
    <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4" data-testid="backup-summary">
      <li className="rounded-xl bg-card p-2">
        <span className="block font-display text-xl">{s.answers}</span>answers
      </li>
      <li className="rounded-xl bg-card p-2">
        <span className="block font-display text-xl">{s.sessions}</span>sessions
      </li>
      <li className="rounded-xl bg-card p-2">
        <span className="block font-display text-xl">{s.charactersPractised}</span>characters
      </li>
      <li className="rounded-xl bg-card p-2">
        <span className="block font-display text-xl">{s.saved}</span>saved words
      </li>
    </ul>
  );
}

function StorageSection() {
  const [estimate, setEstimate] = useState<{ usage: number; quota: number }>();
  const [persisted, setPersisted] = useState<boolean>();

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => setEstimate({ usage: e.usage ?? 0, quota: e.quota ?? 0 }));
    navigator.storage?.persisted?.().then(setPersisted);
  }, []);

  if (!navigator.storage) return null;
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

  return (
    <section className="card space-y-3" aria-labelledby="storage">
      <h2 id="storage" className="font-display text-xl font-semibold">
        Storage on this device
      </h2>
      {estimate && <p className="text-sm text-muted">Using {mb(estimate.usage)} for offline data and progress.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {persisted
            ? '✓ Protected: the browser won’t clear this data to free up space.'
            : 'Not protected: the browser may clear this data if the device runs low on space.'}
        </p>
        {!persisted && navigator.storage.persist && (
          <button type="button" className="btn-secondary text-sm" onClick={() => navigator.storage.persist().then(setPersisted)}>
            Protect my data
          </button>
        )}
      </div>
    </section>
  );
}
