import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { financialService, type MonthSummaryDetail } from '../../services/financialService';
import { dashboardService } from '../../services/dashboardService';
import { chargeService } from '../../services/chargeService';
import type { DashboardMetrics, Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusFilter } from '../../components/ui/StatusFilter';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

type MovTab = 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE';

const statusParamMap: Record<string, MovTab> = {
  'recebido': 'PAID',
  'a-receber': 'PENDING',
  'atrasado': 'OVERDUE',
  'todas': 'ALL',
};

const tabParamMap: Record<MovTab, string> = {
  PAID: 'recebido',
  PENDING: 'a-receber',
  OVERDUE: 'atrasado',
  ALL: 'todas',
};

export const FinancialPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [monthSummaries, setMonthSummaries] = useState<MonthSummaryDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // URL Query Params Sync
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatusParam = searchParams.get('status');
  const initialMovFilter: MovTab = (initialStatusParam && statusParamMap[initialStatusParam]) || 'ALL';

  const [movFilter, setMovFilter] = useState<MovTab>(initialMovFilter);
  const [movSearch, setMovSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  // Selected Month Detail Modal
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<MonthSummaryDetail | null>(null);

  // Expand "Precisa de atenção"
  const [showAllAttention, setShowAllAttention] = useState(false);

  const movimentacoesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { openNewRentalModal } = useOutletContext<{ openNewRentalModal: () => void }>() || {
    openNewRentalModal: () => {},
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [m, allCharges, mSummaries] = await Promise.all([
        dashboardService.getMetrics(),
        chargeService.getAll(),
        financialService.getMonthSummaries(),
      ]);
      setMetrics(m);
      setCharges(allCharges);
      setMonthSummaries(mSummaries);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar os dados financeiros.');
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

  // Update URL search params when filter changes
  const handleFilterChange = (newTab: MovTab) => {
    setMovFilter(newTab);
    setVisibleCount(10);
    const paramVal = tabParamMap[newTab];
    if (paramVal && paramVal !== 'todas') {
      setSearchParams({ status: paramVal });
    } else {
      setSearchParams({});
    }
  };

  // Sync state if URL search params change externally (e.g. back button)
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const tabFromUrl = (statusParam && statusParamMap[statusParam]) || 'ALL';
    if (tabFromUrl !== movFilter) {
      setMovFilter(tabFromUrl);
      setVisibleCount(10);
    }
  }, [searchParams]);

  const scrollToMovimentacoes = (targetFilter: MovTab) => {
    handleFilterChange(targetFilter);
    if (movimentacoesRef.current) {
      movimentacoesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSendReminder = async (chargeId: string, tenantName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await chargeService.sendWhatsAppReminder(chargeId);
      toast.success(res.message);
      loadData();
    } catch (err) {
      toast.error(`Falha ao enviar mensagem para ${tenantName}`);
    }
  };

  const openWhatsApp = (tenantPhone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanNumber = tenantPhone.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    window.open(`https://wa.me/${fullNumber}`, '_blank');
  };

  // 3. PRECISA DE ATENÇÃO (Vencidas, Vencendo hoje, Vencendo em breve)
  const todayStr = new Date().toISOString().split('T')[0];
  const attentionItems = charges.filter((c) => {
    if (c.status === 'OVERDUE') return true;
    if (c.status === 'PENDING') {
      const dueTime = new Date(c.dueDate).getTime();
      const todayTime = new Date(todayStr).getTime();
      const diffDays = Math.ceil((dueTime - todayTime) / (1000 * 60 * 60 * 24));
      return diffDays <= 2;
    }
    return false;
  });

  const displayedAttention = showAllAttention ? attentionItems : attentionItems.slice(0, 5);

  // Filtered Movimentações list
  const filteredMovs = charges.filter((c) => {
    const matchesSearch =
      c.tenantName.toLowerCase().includes(movSearch.toLowerCase()) ||
      c.propertyName.toLowerCase().includes(movSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (movFilter === 'PAID') return c.status === 'PAID';
    if (movFilter === 'PENDING') return c.status === 'PENDING';
    if (movFilter === 'OVERDUE') return c.status === 'OVERDUE';
    return true;
  });

  const visibleMovs = filteredMovs.slice(0, visibleCount);

  if (isLoading || !metrics) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* ==================== 1. CABEÇALHO ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Financeiro
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Acompanhe seus recebimentos e veja o que precisa de atenção.
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            fullWidthMobile
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openNewRentalModal}
            className="font-bold shadow-xs shadow-blue-600/20"
          >
            + Novo aluguel
          </Button>
        </div>

        {/* ==================== 2. CARDS PRINCIPAIS (CONTROLANDO A SEÇÃO MOVIMENTAÇÕES) ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* RECEBIDO ESTE MÊS */}
          <button
            onClick={() => scrollToMovimentacoes('PAID')}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-xs ${
              movFilter === 'PAID'
                ? 'ring-2 ring-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700'
                : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                RECEBIDO ESTE MÊS
              </span>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 mt-1.5">
              {formatCurrency(metrics.receivedRevenue)}
            </p>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {metrics.paidCount} pagamentos recebidos
            </p>
          </button>

          {/* A RECEBER */}
          <button
            onClick={() => scrollToMovimentacoes('PENDING')}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-xs ${
              movFilter === 'PENDING'
                ? 'ring-2 ring-blue-500 bg-blue-100/60 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700'
                : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                A RECEBER
              </span>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-100 mt-1.5">
              {formatCurrency(metrics.pendingRevenue)}
            </p>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
              {metrics.dueCount + metrics.dueTodayCount} pagamento aguardando
            </p>
          </button>

          {/* EM ATRASO */}
          <button
            onClick={() => scrollToMovimentacoes('OVERDUE')}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-xs ${
              movFilter === 'OVERDUE'
                ? 'ring-2 ring-rose-500 bg-rose-100/60 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700'
                : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                EM ATRASO
              </span>
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-100 mt-1.5">
              {formatCurrency(metrics.overdueRevenue)}
            </p>
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mt-0.5">
              {metrics.overdueCount} pagamentos atrasados
            </p>
          </button>
        </div>

        {/* ==================== 3. PRECISA DE ATENÇÃO ==================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Precisa de atenção</span>
            </h2>
            {attentionItems.length > 5 && (
              <button
                onClick={() => setShowAllAttention(!showAllAttention)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showAllAttention ? 'Ver menos' : 'Ver todos'}
              </button>
            )}
          </div>

          {attentionItems.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ Tudo certo. Nenhum pagamento precisa da sua atenção.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedAttention.map((chg) => {
                const isToday = chg.dueDate === todayStr;
                const dueTime = new Date(chg.dueDate).getTime();
                const todayTime = new Date(todayStr).getTime();
                const diffDays = Math.ceil((dueTime - todayTime) / (1000 * 60 * 60 * 24));
                const isTomorrow = diffDays === 1;

                return (
                  <div
                    key={chg.id}
                    onClick={() => navigate(`/alugueis/${chg.contractId}`)}
                    className="p-3.5 sm:px-5 sm:py-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug">
                        {chg.tenantName}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{chg.propertyName}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                          {formatCurrency(chg.updatedValue)}
                        </p>
                        <div>
                          {chg.status === 'OVERDUE' && (
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                              🔴 {chg.daysOverdue} dias atrasado
                            </span>
                          )}
                          {chg.status === 'PENDING' && isToday && (
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                              🟡 Vence hoje
                            </span>
                          )}
                          {chg.status === 'PENDING' && isTomorrow && (
                            <span className="text-xs font-bold text-amber-500">
                              🟠 Vence amanhã
                            </span>
                          )}
                          {chg.status === 'PENDING' && !isToday && !isTomorrow && (
                            <span className="text-xs font-bold text-blue-600">
                              🕐 Vence em breve
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        {chg.status === 'OVERDUE' ? (
                          <Button
                            size="sm"
                            variant="danger"
                            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                            onClick={(e) => openWhatsApp(chg.tenantPhone, e)}
                            className="font-bold text-xs"
                          >
                            Cobrar no WhatsApp
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-blue-600" />}
                            onClick={(e) => handleSendReminder(chg.id, chg.tenantName, e)}
                            className="font-bold text-xs"
                          >
                            Lembrete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ==================== 4. SEÇÃO MOVIMENTAÇÕES (EMBEDDED NA PÁGINA) ==================== */}
        <div ref={movimentacoesRef} className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Movimentações
            </h2>
          </div>

          {/* Busca & Filtros Segmented Control */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente ou imóvel..."
                value={movSearch}
                onChange={(e) => setMovSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <StatusFilter
              options={[
                { label: 'Todas', value: 'ALL' },
                { label: 'Recebidas', value: 'PAID' },
                { label: 'A receber', value: 'PENDING' },
                { label: 'Atrasadas', value: 'OVERDUE' },
              ]}
              value={movFilter}
              onChange={(val) => handleFilterChange(val as MovTab)}
            />
          </div>

          {/* Lista de Movimentações (Cards Inline Compactos) */}
          {filteredMovs.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
              <p className="text-slate-500 text-xs sm:text-sm">Nenhuma movimentação encontrada para este filtro.</p>
              {movFilter !== 'ALL' && (
                <Button size="sm" variant="outline" onClick={() => handleFilterChange('ALL')}>
                  Ver todas as movimentações
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {visibleMovs.map((chg) => (
                <div
                  key={chg.id}
                  onClick={() => navigate(`/alugueis/${chg.contractId}`)}
                  className="p-3.5 sm:px-5 sm:py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs cursor-pointer group"
                >
                  {/* Esquerda: Inquilino + Imóvel */}
                  <div className="space-y-0.5">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                      {chg.tenantName}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {chg.propertyName}
                    </p>
                  </div>

                  {/* Direita: Valor + Status + Ações */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2.5 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                        {formatCurrency(chg.updatedValue)}
                      </p>
                      <div className="mt-0.5">
                        {chg.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Recebido em {formatDate(chg.paymentDate || chg.dueDate)}
                          </span>
                        )}
                        {chg.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            <Clock className="w-3.5 h-3.5" /> 🕐 Vence dia {formatDate(chg.dueDate).split('/')[0]}/{formatDate(chg.dueDate).split('/')[1]}
                          </span>
                        )}
                        {chg.status === 'OVERDUE' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> 🔴 {chg.daysOverdue} dias atrasado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botões contextuais de ação rápida */}
                    <div className="flex items-center gap-2">
                      {chg.status === 'OVERDUE' && (
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                          onClick={(e) => openWhatsApp(chg.tenantPhone, e)}
                          className="font-bold text-xs"
                          fullWidthMobile
                        >
                          Cobrar no WhatsApp
                        </Button>
                      )}

                      {chg.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<MessageSquare className="w-3.5 h-3.5 text-blue-600" />}
                          onClick={(e) => handleSendReminder(chg.id, chg.tenantName, e)}
                          className="font-semibold text-xs"
                          fullWidthMobile
                        >
                          Enviar cobrança
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/alugueis/${chg.contractId}`);
                        }}
                        className="font-semibold text-xs"
                        fullWidthMobile
                      >
                        Ver aluguel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginação / Carregar Mais */}
              {visibleCount < filteredMovs.length && (
                <div className="pt-2 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="font-bold text-xs"
                  >
                    Carregar mais movimentações ({filteredMovs.length - visibleCount} restantes)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================== 5. ÚLTIMOS MESES ==================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Últimos meses
          </h2>

          <div className="space-y-2.5">
            {monthSummaries.map((mDetail) => (
              <button
                key={mDetail.monthKey}
                onClick={() => setSelectedMonthDetail(mDetail)}
                className="w-full p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between cursor-pointer text-left group"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {mDetail.label}
                  </span>
                  <p className="text-xs text-slate-500 font-medium">
                    {mDetail.paidCount} pagamentos
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">
                    {formatCurrency(mDetail.totalReceived)} recebido
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== MODAL DETALHE DO MÊS ==================== */}
        {selectedMonthDetail && (
          <Modal
            isOpen={!!selectedMonthDetail}
            onClose={() => setSelectedMonthDetail(null)}
            title={selectedMonthDetail.label}
            maxWidth="md"
          >
            <div className="space-y-5 p-1">
              {/* 3 Indicadores do mês */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Recebido</span>
                  <p className="text-base font-black text-emerald-900 dark:text-emerald-100 mt-0.5">
                    {formatCurrency(selectedMonthDetail.totalReceived)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">A receber</span>
                  <p className="text-base font-black text-blue-900 dark:text-blue-100 mt-0.5">
                    {formatCurrency(selectedMonthDetail.totalPending)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">Em atraso</span>
                  <p className="text-base font-black text-rose-900 dark:text-rose-100 mt-0.5">
                    {formatCurrency(selectedMonthDetail.totalOverdue)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Pagamentos
                </h4>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedMonthDetail.payments.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {p.tenantName}
                        </p>
                        <p className="text-xs text-slate-400">{p.propertyName}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          {formatCurrency(p.value)}
                        </p>
                        <div>
                          {p.status === 'PAID' && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              ✓ Pago em {formatDate(p.date)}
                            </span>
                          )}
                          {p.status === 'PENDING' && (
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              🕐 A receber
                            </span>
                          )}
                          {p.status === 'OVERDUE' && (
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                              🔴 Atrasado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => setSelectedMonthDetail(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageContainer>
  );
};
