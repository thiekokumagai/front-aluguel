import React from 'react';
import { clsx } from 'clsx';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 animate-in fade-in duration-200',
        className
      )}
    >
      {children}
    </div>
  );
};
