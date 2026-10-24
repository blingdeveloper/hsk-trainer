import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CharacterAnswerInput } from '../../src/features/exam/QuestionViews';

function setup() {
  const onCommit = vi.fn();
  render(<CharacterAnswerInput label="Answer" value="" disabled={false} onCommit={onCommit} />);
  return { input: screen.getByLabelText('Answer') as HTMLInputElement, onCommit };
}

describe('CharacterAnswerInput', () => {
  it('does not cut pinyin while a Chinese keyboard is composing', () => {
    const { input, onCommit } = setup();
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'x' } });
    fireEvent.change(input, { target: { value: 'xue' } });
    expect(input.value).toBe('xue');
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '学' } });
    fireEvent.compositionEnd(input, { target: { value: '学' } });
    expect(onCommit).toHaveBeenLastCalledWith('学');
    expect(input.value).toBe('学');
  });

  it('keeps only the last Chinese character typed', () => {
    const { input, onCommit } = setup();
    fireEvent.change(input, { target: { value: '学校' } });
    expect(onCommit).toHaveBeenLastCalledWith('校');
    expect(input.value).toBe('校');
  });

  it('rejects Latin letters with a hint instead of keeping the last letter', () => {
    const { input, onCommit } = setup();
    fireEvent.change(input, { target: { value: 'xue' } });
    expect(onCommit).toHaveBeenLastCalledWith('');
    expect(input.value).toBe('xue');
    expect(screen.getByRole('status').textContent).toContain('Type a Chinese character');
  });
});
