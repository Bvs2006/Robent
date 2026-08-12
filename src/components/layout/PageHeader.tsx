import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-fleet-border)] shrink-0 bg-[var(--color-fleet-bg)]">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[var(--color-fleet-text)]">{title}</h2>
        <p className="text-sm text-[var(--color-fleet-text-secondary)]">{description}</p>
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};
