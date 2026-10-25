import { LEVEL_IDS, LEVELS, officialSection } from '../../content/levels';
import type { LevelId, PracticeSet, Question, QuestionGroup, Skill } from '../../content/types';
import { scaledMinutes } from './scoring';

/** Something you can sit: a practice set, a mock exam built from sets, or your open mistakes. */
export interface Paper {
  id: string;
  kind: 'set' | 'mock' | 'mistakes';
  level: LevelId;
  title: string;
  groups: QuestionGroup[];
  /** Questions in paper order (group order, then order within the group). */
  questions: Question[];
  /** Sections present in this paper, in exam order. */
  sections: Skill[];
  /** Minutes per section in timed mode. */
  minutes: Partial<Record<Skill, number>>;
}

const ALL_SETS = LEVEL_IDS.flatMap((l) => LEVELS[l].sets);
const ALL_GROUPS = new Map(ALL_SETS.flatMap((s) => s.groups).map((g) => [g.id, g]));
const ALL_QUESTIONS = new Map(ALL_SETS.flatMap((s) => s.questions).map((q) => [q.id, q]));

export function questionById(id: string): Question | undefined {
  return ALL_QUESTIONS.get(id);
}

export function groupById(id: string): QuestionGroup | undefined {
  return ALL_GROUPS.get(id);
}

const SECTION_ORDER: Skill[] = ['reading', 'writing'];

function makePaper(id: string, kind: Paper['kind'], level: LevelId, title: string, groups: QuestionGroup[], questions: Question[]): Paper {
  const ordered = groups.flatMap((g) => questions.filter((q) => q.groupId === g.id));
  const sections = SECTION_ORDER.filter((s) => ordered.some((q) => q.skill === s));
  const minutes: Paper['minutes'] = {};
  for (const s of sections) minutes[s] = scaledMinutes(ordered.filter((q) => q.skill === s).length, officialSection(level, s));
  return { id, kind, level, title, groups, questions: ordered, sections, minutes };
}

export function paperFromSet(set: PracticeSet): Paper {
  return makePaper(`${LEVELS[set.level].paperPrefix}set-${set.id}`, 'set', set.level, set.title, set.groups, set.questions);
}

/**
 * Mock exams follow the level's official paper order (see LEVELS[…].mockLayout).
 * Groups are rotated across the level's sets so each mock mixes different sets.
 * Listening and Reading Part 1 aren't available yet.
 */
export function buildMock(levelId: LevelId, k: number): Paper {
  const { sets, mockLayout, paperPrefix } = LEVELS[levelId];
  const groups = mockLayout.map(({ taskType, fromSet }) => sets[(k + fromSet) % sets.length].groups.find((g) => g.taskType === taskType)!);
  const ids = new Set(groups.map((g) => g.id));
  const questions = sets.flatMap((s) => s.questions).filter((q) => ids.has(q.groupId));
  return makePaper(`${paperPrefix}mock-${k + 1}`, 'mock', levelId, `Mock exam ${k + 1}`, groups, questions);
}

export function setPapers(levelId: LevelId): Paper[] {
  return LEVELS[levelId].sets.map(paperFromSet);
}

/** One mock per set (rotations), or none while a level has fewer sets than its layout needs. */
export function mockPapers(levelId: LevelId): Paper[] {
  const { sets, mockLayout } = LEVELS[levelId];
  const needed = Math.max(...mockLayout.map((m) => m.fromSet)) + 1;
  return sets.length >= needed ? sets.map((_, k) => buildMock(levelId, k)) : [];
}

/** HSK 2 papers, kept as named exports for existing tests and screens. */
export const SET_PAPERS = setPapers(2);
export const MOCK_PAPERS = mockPapers(2);

/** A guided paper of the given questions, grouped as they appear in their sets. */
export function paperFromMistakes(questionIds: string[]): Paper {
  const questions = questionIds.map(questionById).filter((q): q is Question => !!q);
  const groupIds = new Set(questions.map((q) => q.groupId));
  const groups = ALL_SETS.flatMap((s) => s.groups).filter((g) => groupIds.has(g.id));
  // Keep reading before writing whatever the sets' order.
  groups.sort((a, b) => SECTION_ORDER.indexOf(a.skill) - SECTION_ORDER.indexOf(b.skill));
  const level = questions[0]?.level ?? 2;
  return makePaper('mistakes', 'mistakes', level, 'My mistakes', groups, questions);
}

/** Finds a paper by id. Mistake papers need their question list. */
export function findPaper(id: string, questionIds?: string[]): Paper | undefined {
  if (id === 'mistakes') return questionIds ? paperFromMistakes(questionIds) : undefined;
  return LEVEL_IDS.flatMap((l) => [...setPapers(l), ...mockPapers(l)]).find((p) => p.id === id);
}

/** Level of an attempt: from its question (works for every paper, including "My mistakes"). */
export function attemptLevel(questionId: string): LevelId {
  return questionById(questionId)?.level ?? 2;
}

export function paperTitle(paperId: string | undefined, questionId: string): string {
  if (paperId) return paperId === 'mistakes' ? 'My mistakes' : (findPaper(paperId)?.title ?? 'Practice');
  // Attempts saved before paper ids existed: question ids start with the set id ("b-r2-1").
  return HSK2_TITLE.get(questionId.split('-')[0]) ?? 'Practice';
}

const HSK2_TITLE = new Map(LEVELS[2].sets.map((s) => [s.id, s.title]));

/** "Reading Parts 2–4 (15 questions)" style summary of what a paper contains, per section. */
export function describeSections(paper: Paper): { skill: Skill; text: string }[] {
  return paper.sections.map((skill) => {
    const groups = paper.groups.filter((g) => g.skill === skill);
    const parts: { label: string; count: number }[] = [];
    for (const g of groups) {
      const label = g.officialPart.replace(/^(Reading|Writing) /, '');
      const count = paper.questions.filter((q) => q.groupId === g.id).length;
      const existing = parts.find((p) => p.label === label);
      if (existing) existing.count += count;
      else parts.push({ label, count });
    }
    const name = skill === 'reading' ? 'Reading' : 'Writing';
    return { skill, text: `${name} ${parts.map((p) => `${p.label} (${p.count})`).join(', ')} in ${paper.minutes[skill]} min` };
  });
}
