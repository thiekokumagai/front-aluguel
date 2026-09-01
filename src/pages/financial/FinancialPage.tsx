import React, { useState, useEffect } from 'react';
import { financialService } from '../../services/financialService';
import { dashboardService } from '../../services/dashboardService';
import type { FinancialTransaction, DashboardMetrics } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const FinancialPage: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const txs = await financialService.getAll();
        const m = await dashboardService.getMetrics();
        const cData = await financialService.getMonthlyRevenue12Months();

        setTransactions(txs);
        setMetrics(m);
        setChartData(cData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading || !metrics) {
    return <div className="p-8 text-center text-slate-500">Carregando visão financeira...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="DRE simplificado, fluxo de caixa e extrato de lançamentos."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(metrics.expectedRevenue)}
          subtitle="Projeção total de entradas"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Receita Recebida"
          value={formatCurrency(metrics.receivedRevenue)}
          subtitle="Efetivado em conta"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Receita Pendente"
          value={formatCurrency(metrics.pendingRevenue)}
          subtitle="A vencer no período"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Receita Atrasada"
          value={formatCurrency(metrics.overdueRevenue)}
          subtitle="Pendente de cobrança"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* 12-Month Revenue Chart */}
      <Card>
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Evolução de Receita (Últimos 12 Meses)
          </h3>
          <p className="text-xs text-slate-500">Histórico acumulado de entradas brutas em R$</p>
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
              <Bar dataKey="receita" fill="#2563eb" radius={[4, 4, 0, 0]} name="Receita Bruta" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Extrato Table & Filters */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Extrato Financeiro
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar lançamento..."
              className="w-full sm:w-64"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { label: 'Todos os tipos', value: 'ALL' },
                { label: 'Aluguel', value: 'Aluguel' },
                { label: 'Multa', value: 'Multa' },
                { label: 'Juros', value: 'Juros' },
                { label: 'Outros', value: 'Outros' },
              ]}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="w-8 h-8" />}
            title="Nenhum lançamento no extrato"
            description="Ajuste a busca para encontrar registros financeiros."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Inquilino</th>
                  <th className="px-4 py-3">Imóvel</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((ft) => (
                  <tr key={ft.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(ft.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {ft.description}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{ft.tenantName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{ft.propertyName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ft.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(ft.value)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {ft.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
