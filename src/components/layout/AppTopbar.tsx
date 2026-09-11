import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationPopover } from '../notifications/NotificationPopover';
import { GlobalSearchModal } from './GlobalSearchModal';
import { Button } from '../ui/Button';
import {
  Menu,
  Search,
  Plus,
  Moon,
  Sun,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface AppTopbarProps {
  onOpenMobileMenu: () => void;
  onOpenNewChargeModal: () => void;
}

export const AppTopbar: React.FC<AppTopbarProps> = ({
  onOpenMobileMenu,
  onOpenNewChargeModal,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (path: string): string => {
    if (path.startsWith('/dashboard')) return 'Início';
    if (path.startsWith('/alugueis')) return 'Meus Aluguéis';
    if (path.startsWith('/clientes') || path.startsWith('/inquilinos')) return 'Clientes';
    if (path.startsWith('/imoveis')) return 'Meus Imóveis';
    if (path.startsWith('/contratos')) return 'Contratos';
    if (path.startsWith('/cobrancas')) return 'Cobranças';
    if (path.startsWith('/calendario')) return 'Calendário';
    if (path.startsWith('/financeiro')) return 'Financeiro';
    if (path.startsWith('/relatorios')) return 'Relatórios';
    if (path.startsWith('/configuracoes')) return 'Configurações';
    return 'Assistente de Aluguel';
  };

  return (
    <>
      <header className="h-16 sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Menu & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden"
            aria-label="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {getPageTitle(location.pathname)}
          </h2>
        </div>

        {/* Center: Search Trigger (Desktop ONLY) */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Buscar aluguel, cliente...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Action Button (Desktop ONLY, on mobile the bottom + button is used) */}
          <div className="hidden sm:block">
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onOpenNewChargeModal}
              className="font-bold shadow-xs"
            >
              + Novo aluguel
            </Button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <NotificationPopover />

          {/* User Profile Menu */}
          <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px]"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={user?.name || 'Usuário'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <span className="hidden md:inline text-sm font-semibold text-slate-700 dark:text-slate-200">
                {user?.name || 'Eduardo Martins'}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || 'Eduardo Martins'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || 'eduardo@gestao.com'}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/configuracoes"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Meu Perfil</span>
                  </Link>
                  <Link
                    to="/configuracoes"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    <span>Configurações</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair do sistema</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
