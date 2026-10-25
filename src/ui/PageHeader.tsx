import type { ReactNode } from 'react';

/** Consistent page title: a Chinese eyebrow, a display heading and an optional line of help. */
export default function PageHeader({ han, title, children, actions }: { han: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div className="max-w-2xl">
        <p className="eyebrow han" lang="zh-CN">
          {han}
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold md:text-4xl">{title}</h1>
        {children && <div className="mt-2 text-muted">{children}</div>}
      </div>
      {actions}
    </header>
  );
}
