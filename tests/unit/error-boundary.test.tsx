import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../src/ui/ErrorBoundary';
import { parseRoute } from '../../src/lib/router';

function Broken(): never {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  it('shows a way out instead of a blank page when a page breaks', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert').textContent).toContain('Something went wrong');
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to Today' }).getAttribute('href')).toBe('#/');
    expect(screen.getByText('kaboom')).toBeTruthy();
    quiet.mockRestore();
  });

  it('shows the page normally when nothing breaks', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeTruthy();
  });
});

describe('parseRoute with broken links', () => {
  it('keeps badly encoded text instead of throwing', () => {
    expect(parseRoute('#/entry/%E0%A4%A')).toEqual({ name: 'entry', word: '%E0%A4%A' });
    expect(parseRoute('#/characters/%E0%A4%A')).toEqual({ name: 'characters', char: '%E0%A4%A' });
    expect(parseRoute('#/entry/%E5%AD%A6')).toEqual({ name: 'entry', word: '学' });
  });
});
