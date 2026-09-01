import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { chargeService } from '../../services/chargeService';
import type { Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ChargeStatusBadge } from '../../components/common/ChargeStatusBadge';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { NewChargeModal } from '../../components/common/NewChargeModal';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  MessageCircle,
  Copy,
  CheckSquare,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const ChargesListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [charges, setCharges] = useState<Charge[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('status') || 'ALL');
  const [isNewChargeOpen, setIsNewChargeOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const loadCharges = async () => {
    try {
      const data = await chargeService.getAll();
      setCharges(data);
    } catch (err) {
      toast.error('Erro ao carregar cobranças');
    }
  };

  useEffect(() => {
    loadCharges();
  }, []);

  const handleMarkAsPaid = async (id: string, tenantName: string) => {
    try {
      await chargeService.markAsPaid(id, 'PIX');
      toast.success(`Cobrança de ${tenantName} marcada como PAGA!`);
      loadCharges();
    } catch (err) {
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const handleSendWhatsApp = async (id: string) => {
    try {
      const res = await chargeService.sendWhatsAppReminder(id);
      toast.success(res.message);
      loadCharges();
    } catch (err) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleCopyPix = (pixCode?: string) => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    toast.success('Código PIX Copia e Cola copiado para a área de transferência!');
  };

  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;
    try {
      await chargeService.cancel(cancelTargetId);
      toast.success('Cobrança cancelada.');
      setCancelTargetId(null);
      loadCharges();
    } catch (err) {
      toast.error('Erro ao cancelar cobrança');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = charges.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      c.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      c.competence.includes(search);

    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'PENDING') return matchesSearch && c.status === 'PENDING' && c.dueDate !== todayStr;
    if (activeTab === 'DUE_TODAY') return matchesSearch && c.dueDate === todayStr && c.status === 'PENDING';
    if (activeTab === 'PAID') return matchesSearch && c.status === 'PAID';
    if (activeTab === 'OVERDUE') return matchesSearch && c.status === 'OVERDUE';
    if (activeTab === 'CANCELED') return matchesSearch && c.status === 'CANCELED';

    return matchesSearch;
  });

  const totalMonth = charges.reduce((acc, c) => acc + c.originalValue, 0);
  const paidTotal = charges.filter((c) => c.status === 'PAID').reduce((acc, c) => acc + c.updatedValue, 0);
  const pendingTotal = charges.filter((c) => c.status === 'PENDING').reduce((acc, c) => acc + c.originalValue, 0);
  const overdueTotal = charges.filter((c) => c.status === 'OVERDUE').reduce((acc, c) => acc + c.updatedValue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cobranças"
        description="Painel de controle financeiro de pagamentos, PIX e envio por WhatsApp."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewChargeOpen(true)}
          >
            + Nova cobrança
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total do Mês"
          value={formatCurrency(totalMonth)}
          subtitle="Previsão bruta de cobranças"
          icon={<CreditCard className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Recebido"
          value={formatCurrency(paidTotal)}
          subtitle="Entrada confirmada em conta"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Pendente"
          value={formatCurrency(pendingTotal)}
          subtitle="Aguardando vencimento"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Atrasado"
          value={formatCurrency(overdueTotal)}
          subtitle="Acumulado com multa e juros"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'ALL', label: 'Todas', count: charges.length },
              { id: 'PENDING', label: 'A vencer', count: charges.filter((c) => c.status === 'PENDING' && c.dueDate !== todayStr).length },
              { id: 'DUE_TODAY', label: 'Vencendo hoje', count: charges.filter((c) => c.dueDate === todayStr && c.status === 'PENDING').length },
              { id: 'PAID', label: 'Pagas', count: charges.filter((c) => c.status === 'PAID').length },
              { id: 'OVERDUE', label: 'Atrasadas', count: charges.filter((c) => c.status === 'OVERDUE').length },
              { id: 'CANCELED', label: 'Canceladas', count: charges.filter((c) => c.status === 'CANCELED').length },
            ]}
          />

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por inquilino, imóvel ou competência..."
            className="w-full sm:max-w-xs"
          />
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-8 h-8" />}
            title="Nenhuma cobrança nesta aba"
            description="Não foram encontradas cobranças correspondentes aos filtros selecionados."
            actionLabel="+ Gerar Cobrança"
            onAction={() => setIsNewChargeOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Inquilino</th>
                  <th className="px-4 py-3">Imóvel</th>
                  <th className="px-4 py-3">Competência</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Forma Pagto</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {c.tenantName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{c.propertyName}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{c.competence}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(c.updatedValue)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{formatDate(c.dueDate)}</td>
                    <td className="px-4 py-3.5">
                      <ChargeStatusBadge status={c.status} isDueToday={c.dueDate === todayStr} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {c.paymentMethod ? `${c.paymentMethod} (${formatDate(c.paymentDate)})` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Visualizar Detalhes"
                        onClick={() => navigate(`/cobrancas/${c.id}`)}
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        title="Cobrar via WhatsApp"
                        onClick={() => handleSendWhatsApp(c.id)}
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        title="Copiar Código PIX"
                        onClick={() => handleCopyPix(c.pixCode)}
                      >
                        <Copy className="w-4 h-4 text-slate-600" />
                      </Button>

                      {c.status !== 'PAID' && c.status !== 'CANCELED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Marcar como Pago"
                          onClick={() => handleMarkAsPaid(c.id, c.tenantName)}
                        >
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        </Button>
                      )}

                      {c.status !== 'CANCELED' && c.status !== 'PAID' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Cancelar Cobrança"
                          onClick={() => setCancelTargetId(c.id)}
                        >
                          <XCircle className="w-4 h-4 text-rose-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Cobrança"
        description="Tem certeza que deseja cancelar esta cobrança? Esta ação não pode ser desfeita."
      />

      {/* New Charge Modal */}
      <NewChargeModal
        isOpen={isNewChargeOpen}
        onClose={() => setIsNewChargeOpen(false)}
        onSuccess={loadCharges}
      />
    </div>
  );
};
