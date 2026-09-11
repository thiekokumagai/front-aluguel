import { clsx } from 'clsx';

export interface FilterOption<T extends string = string> {
  id?: T;
  value?: T;
  label: string;
  count?: number;
  variant?: 'default' | 'success' | 'info' | 'danger' | 'warning';
}

interface StatusFilterProps<T extends string = string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function StatusFilter<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: StatusFilterProps<T>) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl max-w-full overflow-x-auto no-scrollbar border border-slate-200/60 dark:border-slate-700/60',
        className
      )}
    >
      {options.map((opt) => {
        const keyVal = (opt.id || opt.value) as T;
        const isActive = value === keyVal;

        const variantActiveStyles = {
          default: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs',
          success: 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs',
          info: 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs',
          warning: 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs',
          danger: 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs',
        };

        return (
          <button
            key={keyVal}
            type="button"
            onClick={() => onChange(keyVal)}
            className={clsx(
              'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer min-h-[36px] flex items-center gap-1.5 select-none',
              isActive
                ? variantActiveStyles[opt.variant || 'default']
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            )}
          >
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400'
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
