import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            'block w-full rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 py-2.5',
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500'
              : 'border-slate-300 dark:border-slate-700',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
