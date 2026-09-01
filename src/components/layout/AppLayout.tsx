import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { NewChargeModal } from '../common/NewChargeModal';
import { Toaster } from 'sonner';

export const AppLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNewChargeOpen, setIsNewChargeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <AppSidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:pl-64">
        {/* Topbar */}
        <AppTopbar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenNewChargeModal={() => setIsNewChargeOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-400">
          © 2026 AluguelSaaS — Todos os direitos reservados. Preparado para integração NestJS.
        </footer>
      </div>

      {/* Global New Charge Modal */}
      <NewChargeModal
        isOpen={isNewChargeOpen}
        onClose={() => setIsNewChargeOpen(false)}
      />
    </div>
  );
};
