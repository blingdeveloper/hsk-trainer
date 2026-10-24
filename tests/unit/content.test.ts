import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { GROUPS, QUESTIONS } from '../../src/content/hsk2-practice';

const hsk = JSON.parse(readFileSync('public/packs/core/hsk.json', 'utf8'));

describe('HSK 2 practice content', () => {
  it('has unique ids and valid groups', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) expect(GROUPS.find((g) => g.id === q.groupId)?.taskType).toBe(q.taskType);
  });

  it('every answer key points at an existing option', () => {
    for (const q of QUESTIONS) {
      if (q.taskType === 'writing-2-character') continue;
      const options = q.options ?? GROUPS.find((g) => g.id === q.groupId)!.options!;
      expect(options.map((o) => o.key), q.id).toContain(q.correctAnswer);
    }
  });

  it('shared-option groups leave exactly one distractor unused and use each key once', () => {
    for (const g of GROUPS.filter((g) => g.options)) {
      const keys = QUESTIONS.filter((q) => q.groupId === g.id).map((q) => q.correctAnswer);
      expect(new Set(keys).size, g.id).toBe(keys.length);
      expect(g.options!.length - keys.length, g.id).toBe(1);
    }
  });

  it('writing answers are characters from the official HSK 1–2 writing list', () => {
    const writing = new Set(hsk.writingChars['1-2']);
    for (const q of QUESTIONS.filter((q) => q.taskType === 'writing-2-character')) {
      expect(writing.has(q.correctAnswer), q.id).toBe(true);
    }
  });

  it('is honestly labelled as original, HSK 3.0, level 2', () => {
    for (const q of QUESTIONS) {
      expect(q.sourceType).toBe('original');
      expect(q.syllabusVersion).toBe('HSK3.0-2025-11');
      expect(q.level).toBe(2);
    }
  });
});
