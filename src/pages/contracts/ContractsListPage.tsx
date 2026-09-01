import React, { useState, useEffect } from 'react';
import { contractService } from '../../services/contractService';
import { propertyService } from '../../services/propertyService';
import { tenantService } from '../../services/tenantService';
import type { Contract, Property, Tenant } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ContractStatusBadge } from '../../components/common/ContractStatusBadge';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { FileText, Clock, AlertOctagon, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contractSchema, type ContractFormData } from '../../schemas/contractSchema';
import { toast } from 'sonner';

export const ContractsListPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const cList = await contractService.getAll();
      const pList = await propertyService.getAll();
      const tList = await tenantService.getAll();
      setContracts(cList);
      setProperties(pList);
      setTenants(tList);
    } catch (err) {
      toast.error('Erro ao carregar contratos');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      rentValue: 2000,
      dueDay: 5,
      readjustmentType: 'IPCA',
      finePercent: 2,
      interestPercentMonth: 1,
      toleranceDays: 3,
      securityDeposit: 6000,
      autoGenerateCharges: true,
      daysBeforeDueToGenerate: 5,
      autoSendWhatsApp: true,
    },
  });

  const onAddContract = async (data: ContractFormData) => {
    try {
      const prop = properties.find((p) => p.id === data.propertyId);
      const ten = tenants.find((t) => t.id === data.tenantId);

      await contractService.create({
        propertyId: data.propertyId,
        propertyName: prop?.name || 'Imóvel',
        tenantId: data.tenantId,
        tenantName: ten?.name || 'Inquilino',
        startDate: data.startDate,
        endDate: data.endDate,
        rentValue: data.rentValue,
        dueDay: data.dueDay,
        readjustmentType: data.readjustmentType,
        nextReadjustmentDate: data.nextReadjustmentDate,
        finePercent: data.finePercent,
        interestPercentMonth: data.interestPercentMonth,
        toleranceDays: data.toleranceDays,
        securityDeposit: data.securityDeposit,
        notes: data.notes,
        autoGenerateCharges: data.autoGenerateCharges,
        daysBeforeDueToGenerate: data.daysBeforeDueToGenerate,
        autoSendWhatsApp: data.autoSendWhatsApp,
      });

      toast.success('Contrato criado com sucesso e imóvel vinculado!');
      setIsModalOpen(false);
      reset();
      loadData();
    } catch (err) {
      toast.error('Erro ao criar contrato');
    }
  };

  const filtered = contracts.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      c.propertyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = contracts.filter((c) => c.status === 'ACTIVE').length;
  const endingCount = contracts.filter((c) => c.status === 'ENDING').length;
  const endedCount = contracts.filter((c) => c.status === 'ENDED' || c.status === 'CANCELED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Gestão contratual de locações, reajustes e cláusulas financeiras."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Novo contrato
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Contratos Ativos"
          value={activeCount}
          subtitle="Vigência regular"
          icon={<FileText className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Encerrando em Breve"
          value={endingCount}
          subtitle="Vencimento nos próximos 60 dias"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Encerrados / Cancelados"
          value={endedCount}
          subtitle="Histórico arquivado"
          icon={<AlertOctagon className="w-5 h-5" />}
          iconBgColor="bg-slate-100 dark:bg-slate-800"
          iconTextColor="text-slate-600"
        />
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código, inquilino ou imóvel..."
          className="w-full sm:max-w-md"
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: 'Todos os status', value: 'ALL' },
            { label: 'Ativo', value: 'ACTIVE' },
            { label: 'Encerrando', value: 'ENDING' },
            { label: 'Encerrado', value: 'ENDED' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="Nenhum contrato encontrado"
            description="Crie seu primeiro contrato de locação."
            actionLabel="+ Novo Contrato"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Contrato</th>
                  <th className="px-4 py-3.5">Inquilino</th>
                  <th className="px-4 py-3.5">Imóvel</th>
                  <th className="px-4 py-3.5">Vigência</th>
                  <th className="px-4 py-3.5">Valor</th>
                  <th className="px-4 py-3.5">Vencimento</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {c.code}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {c.tenantName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{c.propertyName}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatDate(c.startDate)} até {formatDate(c.endDate)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(c.rentValue)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      Dia {c.dueDay}
                    </td>
                    <td className="px-4 py-3.5">
                      <ContractStatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Contract Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="+ Novo Contrato de Locação"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onAddContract)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Imóvel *"
              options={properties.map((p) => ({ label: `${p.name} (${p.code})`, value: p.id }))}
              placeholder="Selecione o imóvel..."
              {...register('propertyId')}
              onChange={(e) => {
                const pId = e.target.value;
                setValue('propertyId', pId);
                const p = properties.find((item) => item.id === pId);
                if (p) setValue('rentValue', p.defaultRentValue);
              }}
              error={errors.propertyId?.message}
            />

            <Select
              label="Inquilino *"
              options={tenants.map((t) => ({ label: `${t.name} (${t.document})`, value: t.id }))}
              placeholder="Selecione o inquilino..."
              {...register('tenantId')}
              error={errors.tenantId?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data de Início *"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input
              label="Data de Término *"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Valor do Aluguel (R$) *"
              type="number"
              step="0.01"
              {...register('rentValue', { valueAsNumber: true })}
              error={errors.rentValue?.message}
            />
            <Input
              label="Dia de Vencimento *"
              type="number"
              min="1"
              max="31"
              {...register('dueDay', { valueAsNumber: true })}
              error={errors.dueDay?.message}
            />
            <Select
              label="Tipo de Reajuste *"
              options={[
                { label: 'IPCA', value: 'IPCA' },
                { label: 'IGP-M', value: 'IGP-M' },
                { label: 'Manual', value: 'Manual' },
                { label: 'Sem reajuste', value: 'Sem reajuste' },
              ]}
              {...register('readjustmentType')}
              error={errors.readjustmentType?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Multa (%)"
              type="number"
              {...register('finePercent', { valueAsNumber: true })}
            />
            <Input
              label="Juros (%/mês)"
              type="number"
              {...register('interestPercentMonth', { valueAsNumber: true })}
            />
            <Input
              label="Tolerância (dias)"
              type="number"
              {...register('toleranceDays', { valueAsNumber: true })}
            />
            <Input
              label="Depósito Caução (R$)"
              type="number"
              {...register('securityDeposit', { valueAsNumber: true })}
            />
          </div>

          <Input label="Observações do Contrato" {...register('notes')} />

          {/* Automação de cobrança */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 space-y-3">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
              Automação de Cobrança (PIX & WhatsApp)
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoGen"
                {...register('autoGenerateCharges')}
                className="rounded text-blue-600"
              />
              <label htmlFor="autoGen" className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Gerar cobrança automaticamente todos os meses
              </label>
            </div>

            <div className="pl-6 space-y-2">
              <Input
                label="Quantos dias antes do vencimento gerar a cobrança?"
                type="number"
                {...register('daysBeforeDueToGenerate', { valueAsNumber: true })}
                className="max-w-xs"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="autoWsp"
                {...register('autoSendWhatsApp')}
                className="rounded text-blue-600"
              />
              <label htmlFor="autoWsp" className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Enviar cobrança automaticamente pelo WhatsApp
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Criar Contrato
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
