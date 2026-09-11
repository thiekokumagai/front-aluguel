import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { contractService } from '../../services/contractService';
import { chargeService } from '../../services/chargeService';
import type { Contract, Charge } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusFilter, type FilterOption } from '../../components/ui/StatusFilter';
import { Button } from '../../components/ui/Button';
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { CalendarPage } from '../calendar/CalendarPage';

type RentalFilter = 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE';

export const RentalsListPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<RentalFilter>('ALL');
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { openNewRentalModal } = useOutletContext<{ openNewRentalModal: () => void }>() || {
    openNewRentalModal: () => {},
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ctrList, chgList] = await Promise.all([
        contractService.getAll(),
        chargeService.getAll(),
      ]);
      setContracts(ctrList);
      setCharges(chgList);
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

  const rentalItems = contracts.map((c) => {
    const relatedCharges = charges.filter((ch) => ch.contractId === c.id);
    const latestCharge = relatedCharges[0] || null;

    let overallStatus: 'PAID' | 'PENDING' | 'OVERDUE' = 'PENDING';
    if (latestCharge) {
      overallStatus = latestCharge.status === 'CANCELED' ? 'PENDING' : latestCharge.status;
    }

    return {
      contract: c,
      latestCharge,
      overallStatus,
    };
  });

  const filteredItems = rentalItems.filter((item) => {
    const matchesSearch =
      item.contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contract.propertyName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'PAID') return item.overallStatus === 'PAID';
    if (filter === 'PENDING') return item.overallStatus === 'PENDING';
    if (filter === 'OVERDUE') return item.overallStatus === 'OVERDUE';
    return true;
  });

  const filterOptions: FilterOption<RentalFilter>[] = [
    { id: 'ALL', label: 'Todos', count: contracts.length },
    { id: 'PAID', label: 'Pagos', variant: 'success' },
    { id: 'PENDING', label: 'A receber', variant: 'info' },
    { id: 'OVERDUE', label: 'Atrasados', variant: 'danger' },
  ];

  if (showCalendarView) {
    return (
      <PageContainer>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Calendário de Aluguéis
          </h1>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCalendarView(false)}
          >
            &larr; Voltar para lista de aluguéis
          </Button>
        </div>
        <CalendarPage />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Meus aluguéis
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Veja quem pagou, quem está pendente e quem está atrasado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CalendarIcon className="w-4 h-4" />}
              onClick={() => setShowCalendarView(true)}
              fullWidthMobile
            >
              Ver calendário
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={openNewRentalModal}
              fullWidthMobile
              className="font-bold shadow-xs shadow-blue-600/20"
            >
              + Novo aluguel
            </Button>
          </div>
        </div>

        {/* Busca & Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pessoa ou imóvel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <StatusFilter options={filterOptions} value={filter} onChange={setFilter} />
        </div>

        {/* Lista Limpa de Aluguéis */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <p className="text-slate-500 text-xs sm:text-sm">Nenhum aluguel encontrado.</p>
            <Button size="sm" variant="primary" onClick={openNewRentalModal}>
              + Cadastrar um aluguel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
          {filteredItems.map(({ contract, latestCharge, overallStatus }) => (
            <div
              key={contract.id}
              className="p-4 sm:px-6 sm:py-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              {/* Infos Inquilino e Imóvel */}
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-normal">
                  {contract.tenantName}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>{contract.propertyName}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-400">Vence todo dia {contract.dueDay}</span>
                </div>
              </div>

              {/* Valor e Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2.5 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                    {formatCurrency(contract.rentValue)}
                    <span className="text-xs font-normal text-slate-400">/mês</span>
                  </p>
                  <div className="mt-0.5">
                    {overallStatus === 'PAID' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pago
                      </span>
                    )}

                    {overallStatus === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <Clock className="w-3.5 h-3.5" /> A receber
                      </span>
                    )}

                    {overallStatus === 'OVERDUE' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> {latestCharge?.daysOverdue || 1} dias atrasado
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  {overallStatus === 'OVERDUE' && latestCharge && (
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                      onClick={() => handleSendReminder(latestCharge.id, contract.tenantName)}
                      fullWidthMobile
                      className="font-bold text-xs"
                    >
                      Lembrete
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => navigate(`/alugueis/${contract.id}`)}
                    fullWidthMobile
                    className="font-semibold text-xs"
                  >
                    Ver aluguel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </PageContainer>
  );
};
