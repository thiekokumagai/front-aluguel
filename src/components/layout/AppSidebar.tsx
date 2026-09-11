import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  Building2,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const AppSidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: 'Início', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Aluguéis', path: '/alugueis', icon: Home },
    { label: 'Clientes', path: '/clientes', icon: Users },
    { label: 'Imóveis', path: '/imoveis', icon: Building2 },
    { label: 'Financeiro', path: '/financeiro', icon: DollarSign },
    { label: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between',
          isCollapsed ? 'lg:w-20' : 'lg:w-56',
          isMobileOpen ? 'translate-x-0 w-56' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Logo */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                    Aluguel<span className="text-blue-600 dark:text-blue-400">Assistente</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Cobranças Automáticas
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    )
                  }
                >
                  <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                  {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info badge */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-xs min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">Automação Ativa</p>
                <p className="text-slate-400 truncate">Cobranças mensais em dia</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
