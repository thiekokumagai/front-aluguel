import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractService } from '../../services/contractService';
import { chargeService } from '../../services/chargeService';
import type { Contract, Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { SendExtraChargeModal } from '../../components/charges/SendExtraChargeModal';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Edit,
  MoreVertical,
  Building2,
  User,
  FileText,
  MessageSquare,
  ShieldCheck,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageContainer } from '../../components/layout/PageContainer';

type RentalTab = 'OVERVIEW' | 'CHARGES' | 'CONTRACT';

export const RentalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [activeTab, setActiveTab] = useState<RentalTab>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);

  const [isExtraChargeOpen, setIsExtraChargeOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const loadRentalDetail = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [ctr, allCharges] = await Promise.all([
        contractService.getById(id),
        chargeService.getAll(),
      ]);

      if (!ctr) {
        toast.error('Aluguel não encontrado.');
        navigate('/alugueis');
        return;
      }

      setContract(ctr);
      setCharges(allCharges.filter((ch) => ch.contractId === ctr.id));
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar detalhes do aluguel.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRentalDetail();
  }, [id]);

  const handleSendReminder = async (chargeId: string) => {
    try {
      const res = await chargeService.sendWhatsAppReminder(chargeId);
      toast.success(res.message);
      loadRentalDetail();
    } catch (err) {
      toast.error('Erro ao enviar cobrança via WhatsApp.');
    }
  };

  const handleEndRental = async () => {
    if (!contract) return;
    if (window.confirm(`Tem certeza que deseja encerrar o aluguel de ${contract.tenantName}?`)) {
      try {
        await contractService.update(contract.id, { status: 'ENDED' });
        toast.success('Aluguel encerrado com sucesso.');
        navigate('/alugueis');
      } catch (err) {
        toast.error('Erro ao encerrar aluguel.');
      }
    }
  };

  if (isLoading || !contract) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  // Determine overall status
  const latestCharge = charges[0] || null;
  const isOverdue = latestCharge?.status === 'OVERDUE';

  // Calculate next due date
  const now = new Date();
  const nextMonth = now.getDate() > contract.dueDay ? now.getMonth() + 1 : now.getMonth();
  const nextDueDate = new Date(now.getFullYear(), nextMonth, contract.dueDay).toLocaleDateString('pt-BR');

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/alugueis')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para aluguéis</span>
        </button>

        {/* Cartão de Detalhe Principal do Aluguel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {contract.propertyName}
              </h1>
              <p className="text-base font-semibold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Inquilino: {contract.tenantName}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(contract.rentValue)}
                <span className="text-xs font-normal text-slate-400">/mês</span>
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Vencimento todo dia {contract.dueDay}
              </p>
            </div>
          </div>

          {/* Abas da Página de Detalhes (Visão geral | Cobranças | Contrato) */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Visão geral
            </button>
            <button
              onClick={() => setActiveTab('CHARGES')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'CHARGES'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Cobranças ({charges.length})
            </button>
            <button
              onClick={() => setActiveTab('CONTRACT')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'CONTRACT'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Contrato
            </button>
          </div>

          {/* ==================== TAB 1: VISÃO GERAL ==================== */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status do Aluguel</span>
                    <div className="mt-1">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-4 h-4" /> 🔴 Atrasado ({latestCharge?.daysOverdue} dias)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> 🟢 Em dia
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Próxima cobrança</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {nextDueDate}
                    </p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* Barra de Ações Rápidas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    size="md"
                    variant="primary"
                    fullWidthMobile
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={() => setIsExtraChargeOpen(true)}
                    className="font-bold shadow-sm"
                  >
                    Enviar cobrança
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    fullWidthMobile
                    leftIcon={<Edit className="w-4 h-4" />}
                    onClick={() => setActiveTab('CONTRACT')}
                  >
                    Editar aluguel
                  </Button>
                </div>

                {/* Menu Dropdown de Ações Secundárias (...) */}
                <div className="relative self-end sm:self-auto">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-sm font-semibold cursor-pointer min-h-[44px] min-w-[44px] justify-center"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMoreMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          setActiveTab('CONTRACT');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>Ver contrato completo</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          navigate(`/imoveis/${contract.propertyId}`);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>Editar imóvel</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          navigate(`/clientes/${contract.tenantId}`);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Editar pessoa (cliente)</span>
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          handleEndRental();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Encerrar aluguel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: COBRANÇAS ==================== */}
          {activeTab === 'CHARGES' && (
            <div className="space-y-4 animate-in fade-in">
              {charges.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">Nenhuma cobrança registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {charges.map((chg) => (
                    <div
                      key={chg.id}
                      className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-base">
                          Mês: {chg.competence}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Vencimento: {formatDate(chg.dueDate)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/60 dark:border-slate-700/60">
                        <div>
                          <p className="font-black text-slate-900 dark:text-slate-100 text-lg">
                            {formatCurrency(chg.updatedValue)}
                          </p>
                          <div className="mt-0.5">
                            {chg.status === 'PAID' && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Pago
                              </span>
                            )}
                            {chg.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                <Clock className="w-3.5 h-3.5" /> 🕐 A receber
                              </span>
                            )}
                            {chg.status === 'OVERDUE' && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ Atrasado
                              </span>
                            )}
                          </div>
                        </div>

                        {chg.status !== 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => handleSendReminder(chg.id)}
                            className="text-xs font-semibold"
                          >
                            Cobrar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: CONTRATO ==================== */}
          {activeTab === 'CONTRACT' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-400">Início do aluguel</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatDate(contract.startDate)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-400">Término do contrato</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatDate(contract.endDate)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-400">Índice de reajuste</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {contract.readjustmentType}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-400">Multa por atraso</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {contract.finePercent}%
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-400">Juros de mora</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {contract.interestPercentMonth}% ao mês
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-400">Depósito Caução</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {contract.securityDeposit ? formatCurrency(contract.securityDeposit) : 'Sem caução'}
                  </p>
                </div>
              </div>

              {contract.notes && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-sm">
                  <span className="text-xs font-semibold text-slate-400">Observações do contrato</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-1">{contract.notes}</p>
                </div>
              )}

              {/* Ações do Contrato */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    size="md"
                    variant="outline"
                    fullWidthMobile
                    leftIcon={<Edit className="w-4 h-4" />}
                    onClick={() => toast.info('Edição rápida de contrato.')}
                    className="font-bold text-xs"
                  >
                    Editar contrato
                  </Button>
                  <Button
                    size="md"
                    variant="ghost"
                    fullWidthMobile
                    leftIcon={<FileText className="w-4 h-4" />}
                    onClick={() => navigate('/contratos')}
                    className="font-semibold text-xs text-slate-600 dark:text-slate-400"
                  >
                    Ver contrato completo
                  </Button>
                </div>

                <Button
                  size="md"
                  variant="danger"
                  fullWidthMobile
                  leftIcon={<Ban className="w-4 h-4" />}
                  onClick={handleEndRental}
                  className="font-bold text-xs"
                >
                  Encerrar aluguel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Cobrança Extra */}
        <SendExtraChargeModal
          isOpen={isExtraChargeOpen}
          onClose={() => setIsExtraChargeOpen(false)}
          defaultContractId={contract.id}
          onSuccess={loadRentalDetail}
        />
      </div>
    </PageContainer>
  );
};
