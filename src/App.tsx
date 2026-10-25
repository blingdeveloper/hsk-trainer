import { useEffect } from 'react';
import { href, useRoute, type Route } from './lib/router';
import WriteView from './features/handwriting/WriteView';
import EntryView from './features/dictionary/EntryView';
import ExamView from './features/exam/ExamView';
import LicencesView from './features/licences/LicencesView';
import CharactersView from './features/characters/CharactersView';
import MistakesView from './features/exam/MistakesView';
import HomeView, { daysUntil } from './features/home/HomeView';
import SettingsView from './features/settings/SettingsView';
import { useUpdateAvailable } from './lib/updates';
import { useLevel, useSettings } from './lib/useSettings';

const NAV: { route: Route; label: string; han: string; also?: Route['name'][] }[] = [
  { route: { name: 'home' }, label: 'Today', han: '今' },
  { route: { name: 'practice' }, label: 'Practice', han: '练', also: ['mistakes'] },
  { route: { name: 'characters' }, label: 'Characters', han: '字' },
  { route: { name: 'write' }, label: 'Lookup', han: '查', also: ['entry'] },
  { route: { name: 'settings' }, label: 'Settings', han: '设', also: ['licences'] },
];

function SidebarCountdown() {
  const [settings] = useSettings();
  const lvl = useLevel();
  const date = settings.examDate;
  if (!date) return null;
  return (
    <div className="mx-3 mt-auto hidden rounded-2xl bg-blush p-4 md:block">
      <p className="text-xs text-muted">{lvl.name} exam in</p>
      <p className="font-display text-2xl font-semibold">{Math.max(0, daysUntil(date))} days</p>
    </div>
  );
}

function UpdateBanner() {
  const [available, reload] = useUpdateAvailable();
  if (!available) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-blush px-4 py-3 text-sm" role="status" data-testid="update-banner">
      <span className="flex-1">
        <strong>A new version is ready.</strong> Your progress is kept. Reload when you're not in the middle of an exam.
      </span>
      <button type="button" className="btn-primary text-sm" onClick={reload}>
        Reload now
      </button>
    </div>
  );
}

export default function App() {
  const route = useRoute();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.name]);

  return (
    <div className="min-h-dvh md:flex">
      {/* Bottom tab bar on phones; left sidebar from tablet width up. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-r md:border-t-0 md:bg-paper md:py-7"
        aria-label="Main"
      >
        <a href={href({ name: 'home' })} className="mb-8 hidden items-center gap-2 px-6 md:flex">
          <span className="han flex h-9 w-9 items-center justify-center rounded-xl bg-rose text-lg text-on-rose" lang="zh-CN">
            汉
          </span>
          <span className="font-display text-lg font-semibold">HSK Trainer</span>
        </a>
        <ul className="mx-auto flex max-w-2xl md:mx-0 md:w-full md:flex-col md:gap-1 md:px-3">
          {NAV.map((n) => {
            const active = n.route.name === route.name || !!n.also?.includes(route.name);
            return (
              <li key={n.label} className="flex-1 md:flex-none">
                <a
                  href={href(n.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] transition md:min-h-12 md:flex-row md:justify-start md:gap-3 md:rounded-2xl md:px-3 md:text-sm ${
                    active ? 'font-medium text-ink md:bg-card md:shadow-[var(--shadow-soft)]' : 'text-muted hover:text-ink md:hover:bg-card/60'
                  }`}
                >
                  <span
                    className={`han flex h-8 w-12 items-center justify-center rounded-full text-base transition md:h-8 md:w-8 md:rounded-xl ${
                      active ? 'bg-rose text-on-rose' : 'bg-transparent group-hover:bg-blush'
                    }`}
                    lang="zh-CN"
                    aria-hidden
                  >
                    {n.han}
                  </span>
                  {n.label}
                </a>
              </li>
            );
          })}
        </ul>
        <SidebarCountdown />
      </nav>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-14 md:pt-10 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <UpdateBanner />
          {route.name === 'home' && <HomeView />}
          {route.name === 'write' && <WriteView />}
          {route.name === 'entry' && <EntryView key={route.word} word={route.word} />}
          {route.name === 'practice' && <ExamView autoResume={route.resume} />}
          {route.name === 'mistakes' && <MistakesView />}
          {route.name === 'characters' && <CharactersView key={route.char ?? ''} char={route.char} />}
          {route.name === 'licences' && <LicencesView />}
          {route.name === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
