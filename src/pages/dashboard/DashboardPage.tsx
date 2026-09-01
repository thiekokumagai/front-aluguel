import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { chargeService } from '../../services/chargeService';
import type { DashboardMetrics, Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatCard } from '../../components/common/StatCard';
import { ChargeStatusBadge } from '../../components/common/ChargeStatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [upcomingCharges, setUpcomingCharges] = useState<Charge[]>([]);
  const [overdueCharges, setOverdueCharges] = useState<Charge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const m = await dashboardService.getMetrics();
      const cData = await dashboardService.getRevenueChartData();
      const allCharges = await chargeService.getAll();

      setMetrics(m);
      setChartData(cData);

      const upcoming = allCharges
        .filter((c) => c.status === 'PENDING')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
      setUpcomingCharges(upcoming);

      const overdue = allCharges
        .filter((c) => c.status === 'OVERDUE')
        .sort((a, b) => b.daysOverdue - a.daysOverdue);
      setOverdueCharges(overdue);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChargeWhatsApp = async (chargeId: string, tenantName: string) => {
    try {
      const res = await chargeService.sendWhatsAppReminder(chargeId);
      toast.success(res.message);
      loadData();
    } catch (err) {
      toast.error(`Falha ao enviar cobrança para ${tenantName}`);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Visão Geral da Carteira
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhamento em tempo real de aluguéis, vencimentos e cobranças.
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Building2 className="w-3.5 h-3.5" />}
            onClick={() => navigate('/imoveis')}
          >
            + Novo imóvel
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Building2 className="w-3.5 h-3.5" />}
            onClick={() => navigate('/inquilinos')}
          >
            + Novo inquilino
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => navigate('/contratos')}
          >
            + Novo contrato
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/cobrancas?status=OVERDUE')}
          >
            Ver atrasados ({metrics.overdueCount})
          </Button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Receita Prevista (Mês)"
          value={formatCurrency(metrics.expectedRevenue)}
          subtitle="Valor total da carteira em 09/2026"
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconTextColor="text-blue-600 dark:text-blue-400"
          badgeText="Previsão Mensal"
          badgeVariant="info"
        />

        <StatCard
          title="Recebido no Mês"
          value={formatCurrency(metrics.receivedRevenue)}
          subtitle={`${metrics.paidCount} cobranças quitadas`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          badgeText="Pagamentos Confirmados"
          badgeVariant="success"
        />

        <StatCard
          title="Pendente (A Vencer)"
          value={formatCurrency(metrics.pendingRevenue)}
          subtitle={`${metrics.dueCount} cobranças aguardando`}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconTextColor="text-amber-600 dark:text-amber-400"
          badgeText="A Vencer"
          badgeVariant="warning"
        />

        <StatCard
          title="Em Atraso"
          value={formatCurrency(metrics.overdueRevenue)}
          subtitle={`${metrics.overdueCount} aluguéis em atraso`}
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/50"
          iconTextColor="text-rose-600 dark:text-rose-400"
          badgeText="Ação Requerida"
          badgeVariant="danger"
          onClick={() => navigate('/cobrancas?status=OVERDUE')}
        />

        <StatCard
          title="Quantidade de Imóveis"
          value={`${metrics.totalProperties} imóveis`}
          subtitle="10 alugados / 1 disponível / 1 inativo"
          icon={<Building2 className="w-6 h-6" />}
          iconBgColor="bg-slate-100 dark:bg-slate-800"
          iconTextColor="text-slate-700 dark:text-slate-300"
          badgeText="Total Cadastrado"
          badgeVariant="neutral"
          onClick={() => navigate('/imoveis')}
        />

        <StatCard
          title="Contratos Ativos"
          value={`${metrics.activeContracts} contratos`}
          subtitle="2 contratos encerrando nos próximos 30 dias"
          icon={<FileText className="w-6 h-6" />}
          iconBgColor="bg-indigo-50 dark:bg-indigo-950/50"
          iconTextColor="text-indigo-600 dark:text-indigo-400"
          badgeText="Vigentes"
          badgeVariant="info"
          onClick={() => navigate('/contratos')}
        />
      </div>

      {/* Situação dos Aluguéis Breakdown */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Situação dos Aluguéis
          </h3>
          <span className="text-xs text-slate-400">Setembro / 2026</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Pagos</p>
            <p className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{metrics.paidCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">A vencer</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">{metrics.dueCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Vencendo hoje</p>
            <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">{metrics.dueTodayCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Atrasados</p>
            <p className="text-xl font-bold text-rose-900 dark:text-rose-200 mt-1">{metrics.overdueCount}</p>
          </div>
        </div>
      </Card>

      {/* Grid Row: Revenue Chart & Overdue List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Recebimentos dos Últimos 6 Meses
                </h3>
                <p className="text-xs text-slate-500">Histórico de receita confirmada em R$</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/financeiro')}>
                Ver extrato &rarr;
              </Button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="recebido" fill="#2563eb" radius={[4, 4, 0, 0]} name="Recebido" />
                  <Bar dataKey="pendente" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pendente" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" /> Aluguéis Atrasados
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                {overdueCharges.length}
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {overdueCharges.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">
                  Nenhum aluguel em atraso no momento! 🎉
                </div>
              ) : (
                overdueCharges.map((chg) => (
                  <div
                    key={chg.id}
                    className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {chg.tenantName}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[180px]">
                          {chg.propertyName}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {chg.daysOverdue} dias atraso
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 border-t border-rose-100 dark:border-rose-900/40 pt-1.5">
                      <div className="flex justify-between">
                        <span>Valor Original:</span>
                        <span>{formatCurrency(chg.originalValue)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                        <span>Multa + Juros:</span>
                        <span>+{formatCurrency(chg.fineValue + chg.interestValue)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-1">
                        <span>Atualizado:</span>
                        <span>{formatCurrency(chg.updatedValue)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="success"
                      className="w-full text-xs py-1.5 bg-emerald-600 hover:bg-emerald-500"
                      leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleChargeWhatsApp(chg.id, chg.tenantName)}
                    >
                      Cobrar via WhatsApp
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Próximos Vencimentos Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Próximos Vencimentos
            </h3>
            <p className="text-xs text-slate-500">Cobranças agendadas para os próximos dias</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/cobrancas')}>
            Ver todas cobranças &rarr;
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Inquilino</th>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingCharges.map((chg) => (
                <tr key={chg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {chg.tenantName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{chg.propertyName}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(chg.originalValue)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(chg.dueDate)}</td>
                  <td className="px-4 py-3">
                    <ChargeStatusBadge
                      status={chg.status}
                      isDueToday={chg.dueDate === new Date().toISOString().split('T')[0]}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/cobrancas/${chg.id}`)}
                    >
                      Visualizar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
