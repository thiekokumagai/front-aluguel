import React from 'react';
import type { ContractStatus } from '../../types';
import { CheckCircle2, Clock, AlertOctagon, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ContractStatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

export const ContractStatusBadge: React.FC<ContractStatusBadgeProps> = ({ status, className }) => {
  if (status === 'ACTIVE') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          className
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Ativo</span>
      </span>
    );
  }

  if (status === 'ENDING') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
          className
        )}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Encerrando</span>
      </span>
    );
  }

  if (status === 'ENDED') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
          className
        )}
      >
        <AlertOctagon className="w-3.5 h-3.5" />
        <span>Encerrado</span>
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
        className
      )}
    >
      <XCircle className="w-3.5 h-3.5" />
      <span>Cancelado</span>
    </span>
  );
};
