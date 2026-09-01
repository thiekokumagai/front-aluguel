import React from 'react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
      <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
