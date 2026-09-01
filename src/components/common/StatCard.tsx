import React from 'react';
import { Card } from '../ui/Card';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-50 dark:bg-blue-950/50',
  iconTextColor = 'text-blue-600 dark:text-blue-400',
  badgeText,
  badgeVariant = 'info',
  onClick,
}) => {
  const badgeStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <Card
      className={clsx(
        'relative overflow-hidden transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-600'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl flex items-center justify-center shrink-0', iconBgColor, iconTextColor)}>
          {icon}
        </div>
      </div>

      {badgeText && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center">
          <span
            className={clsx(
              'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border',
              badgeStyles[badgeVariant]
            )}
          >
            {badgeText}
          </span>
        </div>
      )}
    </Card>
  );
};
