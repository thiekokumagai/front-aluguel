import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
  options?: Option[];
  placeholder?: string;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, labelClassName, error, options, placeholder, children, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className={clsx("block text-sm font-medium", labelClassName || "text-slate-700 dark:text-slate-300")}>
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          <select
            id={selectId}
            ref={ref}
            className={clsx(
              'block w-full rounded-lg border text-sm font-medium transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pl-3.5 pr-10 py-2.5 cursor-pointer',
              !className?.includes('bg-') && 'bg-white dark:bg-slate-900',
              !className?.includes('text-') && 'text-slate-900 dark:text-slate-100',
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
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
