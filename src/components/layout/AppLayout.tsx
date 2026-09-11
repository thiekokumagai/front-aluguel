import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { BottomMobileNav } from './BottomMobileNav';
import { NewRentalModal } from '../rentals/NewRentalModal';
import { SendExtraChargeModal } from '../charges/SendExtraChargeModal';
import { Toaster } from 'sonner';
import { X, Home, CreditCard, Settings } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNewRentalOpen, setIsNewRentalOpen] = useState(false);
  const [isExtraChargeOpen, setIsExtraChargeOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const moreMenuItems = [
    { label: 'Imóveis', path: '/imoveis', icon: Home, desc: 'Lista de todos os seus imóveis' },
    { label: 'Financeiro', path: '/financeiro', icon: CreditCard, desc: 'Acompanhamento e movimentações' },
    { label: 'Configurações', path: '/configuracoes', icon: Settings, desc: 'Perfil e regras do sistema' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16 lg:pb-0">
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <AppSidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:pl-56">
        {/* Topbar */}
        <AppTopbar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenNewChargeModal={() => setIsNewRentalOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 w-full animate-in fade-in duration-200">
          <Outlet context={{ openNewRentalModal: () => setIsNewRentalOpen(true), openExtraChargeModal: () => setIsExtraChargeOpen(true) }} />
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-400">
          © 2026 Assistente de Aluguel — Suas cobranças automatizadas todo mês.
        </footer>
      </div>

      {/* Navegação Inferior Mobile */}
      <BottomMobileNav
        onOpenNewRental={() => setIsNewRentalOpen(true)}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
      />

      {/* Modal / Wizard Guiado + Novo Aluguel */}
      <NewRentalModal
        isOpen={isNewRentalOpen}
        onClose={() => setIsNewRentalOpen(false)}
        onSuccess={() => {
          // Trigger refresh event or state if needed
          window.dispatchEvent(new Event('rental-created'));
        }}
      />

      {/* Modal de Cobrança Extra */}
      <SendExtraChargeModal
        isOpen={isExtraChargeOpen}
        onClose={() => setIsExtraChargeOpen(false)}
      />

      {/* Drawer do Menu "Mais" no Mobile */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end lg:hidden animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Mais Opções</h3>
                <p className="text-xs text-slate-400">Acesso a cadastros e relatórios avançados</p>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMoreMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`
                    }
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold">{item.label}</p>
                      <p className="text-xs font-normal text-slate-400">{item.desc}</p>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
