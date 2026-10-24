import { useEffect, useState } from 'react';
import { href, useRoute, type Route } from './lib/router';
import WriteView from './features/handwriting/WriteView';
import EntryView from './features/dictionary/EntryView';
import ExamView from './features/exam/ExamView';
import LicencesView from './features/licences/LicencesView';
import CharactersView from './features/characters/CharactersView';
import { getSettings } from './db/db';

const NAV: { route: Route; label: string; han: string }[] = [
  { route: { name: 'home' }, label: 'Home', han: '首页' },
  { route: { name: 'write' }, label: 'Lookup', han: '手写' },
  { route: { name: 'practice' }, label: 'Practice', han: '练习' },
  { route: { name: 'characters' }, label: 'Characters', han: '汉字' },
  { route: { name: 'licences' }, label: 'Sources', han: '来源' },
];

function daysUntil(date: string) {
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86_400_000);
}

function Home() {
  const [examDate, setExamDate] = useState<string>();
  useEffect(() => {
    getSettings().then((s) => setExamDate(s.examDate));
  }, []);
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">HSK 2 · HSK 3.0</h1>
        {examDate && (
          <p className="text-muted">
            Exam on {examDate}: <strong className="text-ink">{daysUntil(examDate)} days</strong> to go
          </p>
        )}
      </header>
      <a href={href({ name: 'practice' })} className="card block hover:bg-blush">
        <p className="font-medium">Exam practice →</p>
        <p className="text-sm text-muted">3 sets of reading and writing questions in the official HSK 2 format. Guided or timed.</p>
      </a>
      <a href={href({ name: 'characters' })} className="card block hover:bg-blush">
        <p className="font-medium">Writing characters →</p>
        <p className="text-sm text-muted">Learn all 100 characters you must write for HSK 1–2: watch, trace, then write from memory.</p>
      </a>
      <a href={href({ name: 'write' })} className="card block hover:bg-blush">
        <p className="font-medium">Handwriting dictionary →</p>
        <p className="text-sm text-muted">Draw an unknown character to see its meaning, words that use it, and stroke order. Works offline.</p>
      </a>
      <OfflineStatus />
    </div>
  );
}

function OfflineStatus() {
  const [ready, setReady] = useState<boolean>();
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return setReady(false);
    navigator.serviceWorker.ready.then(() => setReady(true));
  }, []);
  return (
    <p className="text-xs text-muted" data-testid="offline-status">
      {ready === undefined && 'Preparing offline use…'}
      {ready === true && '✓ Ready offline. Dictionary, handwriting and practice all work without internet.'}
      {ready === false && "This browser doesn't support offline install."}
    </p>
  );
}

export default function App() {
  const route = useRoute();
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <main className="flex-1 px-4 pb-24 pt-5">
        {route.name === 'home' && <Home />}
        {route.name === 'write' && <WriteView />}
        {route.name === 'entry' && <EntryView key={route.word} word={route.word} />}
        {route.name === 'practice' && <ExamView />}
        {route.name === 'characters' && <CharactersView key={route.char ?? ''} char={route.char} />}
        {route.name === 'licences' && <LicencesView />}
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 backdrop-blur" aria-label="Main">
        <ul className="mx-auto flex max-w-2xl">
          {NAV.map((n) => {
            const active = n.route.name === route.name || (route.name === 'entry' && n.route.name === 'write');
            return (
              <li key={n.label} className="flex-1">
                <a
                  href={href(n.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center text-xs ${active ? 'text-rose' : 'text-muted'}`}
                >
                  <span className="han text-lg leading-none">{n.han}</span>
                  {n.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
