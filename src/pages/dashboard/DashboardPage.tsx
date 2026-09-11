import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { chargeService } from '../../services/chargeService';
import type { DashboardMetrics, Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusFilter, type FilterOption } from '../../components/ui/StatusFilter';
import { Button } from '../../components/ui/Button';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

type FilterTab = 'ALL' | 'PENDING' | 'PAID' | 'OVERDUE';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { openNewRentalModal, openExtraChargeModal } = useOutletContext<{
    openNewRentalModal: () => void;
    openExtraChargeModal: () => void;
  }>() || { openNewRentalModal: () => {}, openExtraChargeModal: () => {} };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [m, allCharges] = await Promise.all([
        dashboardService.getMetrics(),
        chargeService.getAll(),
      ]);
      setMetrics(m);
      setCharges(allCharges);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar os aluguéis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRentalCreated = () => loadData();
    window.addEventListener('rental-created', handleRentalCreated);
    return () => window.removeEventListener('rental-created', handleRentalCreated);
  }, []);

  const handleSendReminder = async (chargeId: string, tenantName: string) => {
    try {
      const res = await chargeService.sendWhatsAppReminder(chargeId);
      toast.success(res.message);
      loadData();
    } catch (err) {
      toast.error(`Falha ao enviar lembrete para ${tenantName}`);
    }
  };

  const filteredCharges = charges.filter((c) => {
    if (filter === 'PAID') return c.status === 'PAID';
    if (filter === 'PENDING') return c.status === 'PENDING';
    if (filter === 'OVERDUE') return c.status === 'OVERDUE';
    return true;
  });

  const filterOptions: FilterOption<FilterTab>[] = [
    { id: 'ALL', label: 'Todos', count: charges.length },
    { id: 'PENDING', label: 'A receber', count: metrics?.dueCount, variant: 'info' },
    { id: 'PAID', label: 'Pagos', count: metrics?.paidCount, variant: 'success' },
    { id: 'OVERDUE', label: 'Atrasados', count: metrics?.overdueCount, variant: 'danger' },
  ];

  if (isLoading || !metrics) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 2. NOVO CABEÇALHO HUMANIZADO & COMPACTO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Olá, Eduardo 👋
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Veja como estão seus aluguéis este mês.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>✓ Suas cobranças estão sendo enviadas automaticamente.</span>
          </div>
        </div>

        <div>
          <Button
            size="lg"
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={openNewRentalModal}
            fullWidthMobile
            className="font-bold shadow-md shadow-blue-600/20"
          >
            + Novo aluguel
          </Button>
        </div>
      </div>

      {/* 3. RESUMO FINANCEIRO (3 CARDS COMPACTOS - MT 20PX, GAP 16PX) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* CARD 1: RECEBIDO */}
        <button
          onClick={() => setFilter(filter === 'PAID' ? 'ALL' : 'PAID')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group shadow-xs ${
            filter === 'PAID'
              ? 'ring-2 ring-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700'
              : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Recebido
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 mt-1.5">
            {formatCurrency(metrics.receivedRevenue)}
          </p>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {metrics.paidCount} aluguéis pagos
          </p>
        </button>

        {/* CARD 2: A RECEBER */}
        <button
          onClick={() => setFilter(filter === 'PENDING' ? 'ALL' : 'PENDING')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group shadow-xs ${
            filter === 'PENDING'
              ? 'ring-2 ring-blue-500 bg-blue-100/60 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700'
              : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              A receber
            </span>
            <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-100 mt-1.5">
            {formatCurrency(metrics.pendingRevenue)}
          </p>
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
            {metrics.dueCount + metrics.dueTodayCount} aluguel aguardando
          </p>
        </button>

        {/* CARD 3: ATRASADO */}
        <button
          onClick={() => setFilter(filter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group shadow-xs ${
            filter === 'OVERDUE'
              ? 'ring-2 ring-rose-500 bg-rose-100/60 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700'
              : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Atrasado
            </span>
            <div className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-100 mt-1.5">
            {formatCurrency(metrics.overdueRevenue)}
          </p>
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mt-0.5">
            {metrics.overdueCount} aluguéis atrasados
          </p>
        </button>
      </div>

      {/* 4. SEÇÃO PRINCIPAL (ALUGUÉIS DESTE MÊS - MARGIN TOP 24PX) */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Aluguéis deste mês
          </h2>

          {/* Filtros simples reutilizando StatusFilter */}
          <StatusFilter options={filterOptions} value={filter} onChange={setFilter} />
        </div>

        {/* LISTA DE CARDS DE ALUGUEL (GAP 12PX) */}
        {filteredCharges.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <p className="text-slate-500 text-sm">Nenhum aluguel encontrado neste filtro.</p>
            <Button size="sm" variant="outline" onClick={() => setFilter('ALL')}>
              Ver todos os aluguéis
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {filteredCharges.map((chg) => (
              <div
                key={chg.id}
                className="p-4 sm:px-6 sm:py-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs"
              >
                {/* Informações Principais */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-normal">
                    {chg.tenantName}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {chg.propertyName}
                  </p>
                </div>

                {/* Valor + Status + Ação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-end gap-3 sm:gap-5 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2.5 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                      {formatCurrency(chg.updatedValue)}
                    </p>
                    <div className="mt-0.5">
                      {chg.status === 'PAID' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pago em {formatDate(chg.paymentDate || chg.dueDate)}
                        </span>
                      )}

                      {chg.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                          <Clock className="w-3.5 h-3.5" /> A receber • Vence dia {formatDate(chg.dueDate).split('/')[0]}
                        </span>
                      )}

                      {chg.status === 'OVERDUE' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ {chg.daysOverdue} dias atrasado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ação Direta */}
                  <div className="w-full sm:w-auto">
                    {chg.status === 'OVERDUE' && (
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                        onClick={() => handleSendReminder(chg.id, chg.tenantName)}
                        fullWidthMobile
                        className="font-bold text-xs"
                      >
                        Enviar lembrete
                      </Button>
                    )}

                    {chg.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                        onClick={() => handleSendReminder(chg.id, chg.tenantName)}
                        fullWidthMobile
                        className="font-bold text-xs"
                      >
                        Enviar cobrança
                      </Button>
                    )}

                    {chg.status === 'PAID' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/alugueis/${chg.contractId}`)}
                        fullWidthMobile
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                      >
                        Ver aluguel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Atalho discreto para cobrança extra */}
      <div className="pt-2 text-center">
        <button
          onClick={openExtraChargeModal}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1 px-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Precisa cobrar um valor avulso? Enviar cobrança extra</span>
        </button>
      </div>
    </PageContainer>
  );
};
