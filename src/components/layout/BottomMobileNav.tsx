import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, KeyRound, Plus, Users, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';

interface BottomMobileNavProps {
  onOpenNewRental: () => void;
  onOpenMoreMenu: () => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  onOpenNewRental,
  onOpenMoreMenu,
}) => {
  const location = useLocation();

  const isNavActive = (path: string) => location.pathname === path;

  return (
    <nav
      aria-label="Navegação móvel"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Início */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1.5 px-3 rounded-xl min-w-[56px] min-h-[44px] justify-center',
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )
          }
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </NavLink>

        {/* Aluguéis */}
        <NavLink
          to="/alugueis"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1.5 px-3 rounded-xl min-w-[56px] min-h-[44px] justify-center',
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )
          }
        >
          <KeyRound className="w-5 h-5" />
          <span>Aluguéis</span>
        </NavLink>

        {/* Botão central + Novo Aluguel */}
        <div className="relative -top-3">
          <button
            onClick={onOpenNewRental}
            type="button"
            className="w-13 h-13 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all min-w-[48px] min-h-[48px]"
            title="Novo aluguel"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Clientes */}
        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1.5 px-3 rounded-xl min-w-[56px] min-h-[44px] justify-center',
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )
          }
        >
          <Users className="w-5 h-5" />
          <span>Clientes</span>
        </NavLink>

        {/* Mais */}
        <button
          onClick={onOpenMoreMenu}
          type="button"
          className={clsx(
            'flex flex-col items-center gap-1 text-xs font-medium transition-colors py-1.5 px-3 rounded-xl min-w-[56px] min-h-[44px] justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200',
            ['/imoveis', '/financeiro', '/configuracoes', '/contratos', '/cobrancas'].some((p) =>
              isNavActive(p)
            ) && 'text-blue-600 dark:text-blue-400 font-semibold'
          )}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>Mais</span>
        </button>
      </div>
    </nav>
  );
};
