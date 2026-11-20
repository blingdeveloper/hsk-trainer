import { Component, type ReactNode } from 'react';

/**
 * Catches unexpected errors while showing a page, so one broken screen shows a message
 * with a way out instead of a blank app. Progress is stored separately and isn't affected.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Stays on this device: there is no error reporting service.
    console.error('HSK Trainer hit an error:', error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <section className="card mx-auto my-10 max-w-xl space-y-4 text-center" role="alert" data-testid="error-screen">
        <p className="han text-4xl" lang="zh-CN" aria-hidden>
          哎呀
        </p>
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted">
          This page hit an unexpected problem. Your progress is safe: it's saved separately on this device. Try reloading, or go back to
          Today.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary" onClick={() => location.reload()}>
            Reload
          </button>
          <a
            className="btn-secondary"
            href="#/"
            onClick={() => {
              // The page is changing, so try showing it again.
              setTimeout(() => this.setState({ error: undefined }));
            }}
          >
            Go to Today
          </a>
        </div>
        <details className="text-left text-xs text-muted">
          <summary className="cursor-pointer">Details</summary>
          <p className="mt-2 break-words font-mono">{String(error.message || error)}</p>
        </details>
      </section>
    );
  }
}
