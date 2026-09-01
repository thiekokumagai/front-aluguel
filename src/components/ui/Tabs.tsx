import React from 'react';
import { clsx } from 'clsx';

interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
      <nav className="flex space-x-6 min-w-max" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 cursor-pointer',
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-semibold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={clsx(
                    'px-2 py-0.5 text-xs rounded-full font-medium',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
