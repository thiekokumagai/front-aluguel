import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Content - Bottom Sheet on mobile, Centered Modal on desktop */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 text-left overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-[90vh] flex flex-col`}
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              {title && (
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h3>
              )}
              {description && (
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="py-3 sm:py-4 px-1 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
