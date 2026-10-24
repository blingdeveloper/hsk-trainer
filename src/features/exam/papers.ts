import { SETS } from '../../content/sets';
import { OFFICIAL_SECTIONS, type PracticeSet, type Question, type QuestionGroup, type Skill, type TaskType } from '../../content/types';
import { scaledMinutes } from './scoring';

/** Something you can sit: a practice set, a mock exam built from sets, or your open mistakes. */
export interface Paper {
  id: string;
  kind: 'set' | 'mock' | 'mistakes';
  title: string;
  groups: QuestionGroup[];
  /** Questions in paper order (group order, then order within the group). */
  questions: Question[];
  /** Sections present in this paper, in exam order. */
  sections: Skill[];
  /** Minutes per section in timed mode. */
  minutes: Partial<Record<Skill, number>>;
}

const ALL_GROUPS = new Map(SETS.flatMap((s) => s.groups).map((g) => [g.id, g]));
const ALL_QUESTIONS = new Map(SETS.flatMap((s) => s.questions).map((q) => [q.id, q]));

export function questionById(id: string): Question | undefined {
  return ALL_QUESTIONS.get(id);
}

export function groupById(id: string): QuestionGroup | undefined {
  return ALL_GROUPS.get(id);
}

const SECTION_ORDER: Skill[] = ['reading', 'writing'];

function makePaper(id: string, kind: Paper['kind'], title: string, groups: QuestionGroup[], questions: Question[]): Paper {
  const ordered = groups.flatMap((g) => questions.filter((q) => q.groupId === g.id));
  const sections = SECTION_ORDER.filter((s) => ordered.some((q) => q.skill === s));
  const minutes: Paper['minutes'] = {};
  for (const s of sections) minutes[s] = scaledMinutes(ordered.filter((q) => q.skill === s).length, OFFICIAL_SECTIONS[s]);
  return { id, kind, title, groups, questions: ordered, sections, minutes };
}

export function paperFromSet(set: PracticeSet): Paper {
  return makePaper(`set-${set.id}`, 'set', set.title, set.groups, set.questions);
}

function groupOf(set: PracticeSet, taskType: TaskType): QuestionGroup {
  return set.groups.find((g) => g.taskType === taskType)!;
}

/**
 * Mock exams follow the official HSK 2 paper: Reading P2 (5), P3 (two groups of 5),
 * P4 (5), then Writing P1 (5) and P2 (5). Groups are rotated across sets A–C so each
 * mock mixes different sets. Listening and Reading P1 aren't available yet.
 */
export function buildMock(k: number): Paper {
  const [s0, s1, s2] = [0, 1, 2].map((i) => SETS[(k + i) % SETS.length]);
  const groups = [
    groupOf(s0, 'reading-2-word-bank'),
    groupOf(s1, 'reading-3-response-match'),
    groupOf(s2, 'reading-3-response-match'),
    groupOf(s2, 'reading-4-short-passage'),
    groupOf(s1, 'writing-1-component'),
    groupOf(s0, 'writing-2-character'),
  ];
  const ids = new Set(groups.map((g) => g.id));
  const questions = SETS.flatMap((s) => s.questions).filter((q) => ids.has(q.groupId));
  return makePaper(`mock-${k + 1}`, 'mock', `Mock exam ${k + 1}`, groups, questions);
}

export const SET_PAPERS = SETS.map(paperFromSet);
export const MOCK_PAPERS = [0, 1, 2].map(buildMock);

/** A guided paper of the given questions, grouped as they appear in their sets. */
export function paperFromMistakes(questionIds: string[]): Paper {
  const questions = questionIds.map(questionById).filter((q): q is Question => !!q);
  const groupIds = new Set(questions.map((q) => q.groupId));
  const groups = SETS.flatMap((s) => s.groups).filter((g) => groupIds.has(g.id));
  // Keep reading before writing whatever the sets' order.
  groups.sort((a, b) => SECTION_ORDER.indexOf(a.skill) - SECTION_ORDER.indexOf(b.skill));
  return makePaper('mistakes', 'mistakes', 'My mistakes', groups, questions);
}

/** Finds a paper by id. Mistake papers need their question list. */
export function findPaper(id: string, questionIds?: string[]): Paper | undefined {
  if (id === 'mistakes') return questionIds ? paperFromMistakes(questionIds) : undefined;
  return [...SET_PAPERS, ...MOCK_PAPERS].find((p) => p.id === id);
}

export function paperTitle(paperId: string | undefined, questionId: string): string {
  if (paperId) return paperId === 'mistakes' ? 'My mistakes' : (findPaper(paperId)?.title ?? 'Practice');
  // Attempts saved before paper ids existed: question ids start with the set id ("b-r2-1").
  return SETS.find((s) => questionId.startsWith(`${s.id}-`))?.title ?? 'Practice';
}
