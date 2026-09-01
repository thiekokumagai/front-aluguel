import React from 'react';
import type { PropertyStatus } from '../../types';
import { Home, KeyRound, Wrench } from 'lucide-react';
import { clsx } from 'clsx';

interface PropertyStatusBadgeProps {
  status: PropertyStatus;
  className?: string;
}

export const PropertyStatusBadge: React.FC<PropertyStatusBadgeProps> = ({ status, className }) => {
  if (status === 'RENTED') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          className
        )}
      >
        <KeyRound className="w-3.5 h-3.5" />
        <span>Alugado</span>
      </span>
    );
  }

  if (status === 'AVAILABLE') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
          className
        )}
      >
        <Home className="w-3.5 h-3.5" />
        <span>Disponível</span>
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      <Wrench className="w-3.5 h-3.5" />
      <span>Inativo</span>
    </span>
  );
};
