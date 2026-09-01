import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import type { Property } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { PropertyStatusBadge } from '../../components/common/PropertyStatusBadge';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Home, KeyRound, Wrench, Plus, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, type PropertyFormData } from '../../schemas/propertySchema';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const PropertiesListPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadProperties = async () => {
    try {
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (err) {
      toast.error('Erro ao carregar lista de imóveis');
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'Casa',
      status: 'AVAILABLE',
      defaultRentValue: 2000,
      state: 'SP',
    },
  });

  const onAddProperty = async (data: PropertyFormData) => {
    try {
      await propertyService.create({
        name: data.name,
        type: data.type,
        address: {
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        defaultRentValue: data.defaultRentValue,
        status: data.status,
        notes: data.notes,
      });
      toast.success('Imóvel cadastrado com sucesso!');
      setIsModalOpen(false);
      reset();
      loadProperties();
    } catch (err) {
      toast.error('Erro ao cadastrar imóvel');
    }
  };

  const cities = Array.from(new Set(properties.map((p) => p.address.city)));

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.address.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesCity = cityFilter === 'ALL' || p.address.city === cityFilter;
    return matchesSearch && matchesStatus && matchesCity;
  });

  const totalCount = properties.length;
  const rentedCount = properties.filter((p) => p.status === 'RENTED').length;
  const availableCount = properties.filter((p) => p.status === 'AVAILABLE').length;
  const inactiveCount = properties.filter((p) => p.status === 'INACTIVE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imóveis"
        description="Gerencie seu portfólio de imóveis residenciais e comerciais."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Novo imóvel
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Imóveis"
          value={totalCount}
          subtitle="Carteira completa"
          icon={<Home className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Alugados"
          value={rentedCount}
          subtitle="Gerando receita mensal"
          icon={<KeyRound className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Disponíveis"
          value={availableCount}
          subtitle="Prontos para locação"
          icon={<Home className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconTextColor="text-amber-600"
        />
        <StatCard
          title="Inativos / Reforma"
          value={inactiveCount}
          subtitle="Manutenção ou bloqueados"
          icon={<Wrench className="w-5 h-5" />}
          iconBgColor="bg-slate-100 dark:bg-slate-800"
          iconTextColor="text-slate-600"
        />
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código, nome ou bairro..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'Todos os status', value: 'ALL' },
              { label: 'Alugado', value: 'RENTED' },
              { label: 'Disponível', value: 'AVAILABLE' },
              { label: 'Inativo', value: 'INACTIVE' },
            ]}
          />
          <Select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            options={[
              { label: 'Todas as cidades', value: 'ALL' },
              ...cities.map((c) => ({ label: c, value: c })),
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Home className="w-8 h-8" />}
            title="Nenhum imóvel encontrado"
            description="Tente ajustar seus filtros de busca ou cadastre um novo imóvel."
            actionLabel="+ Cadastrar Imóvel"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Código</th>
                  <th className="px-4 py-3.5">Imóvel</th>
                  <th className="px-4 py-3.5">Endereço</th>
                  <th className="px-4 py-3.5">Inquilino Atual</th>
                  <th className="px-4 py-3.5">Valor Padrão</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-500">
                      {p.code}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.type}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {p.address.street}, {p.address.number} - {p.address.neighborhood}, {p.address.city}/{p.address.state}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                      {p.currentTenantName || <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(p.defaultRentValue)}
                    </td>
                    <td className="px-4 py-3.5">
                      <PropertyStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/imoveis/${p.id}`)}
                      >
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="+ Novo Imóvel"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onAddProperty)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nome do Imóvel *"
                placeholder="Ex: Apto 102 - Edifício Paulista"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>
            <Select
              label="Tipo de Imóvel *"
              options={[
                { label: 'Casa', value: 'Casa' },
                { label: 'Apartamento', value: 'Apartamento' },
                { label: 'Sala comercial', value: 'Sala comercial' },
                { label: 'Terreno', value: 'Terreno' },
                { label: 'Outro', value: 'Outro' },
              ]}
              {...register('type')}
              error={errors.type?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Rua / Logradouro *"
                placeholder="Ex: Av. Paulista"
                {...register('street')}
                error={errors.street?.message}
              />
            </div>
            <Input
              label="Número *"
              placeholder="1000"
              {...register('number')}
              error={errors.number?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Complemento"
              placeholder="Apto 44 / Bloco B"
              {...register('complement')}
            />
            <Input
              label="Bairro *"
              placeholder="Bela Vista"
              {...register('neighborhood')}
              error={errors.neighborhood?.message}
            />
            <Input
              label="CEP *"
              placeholder="01310-100"
              {...register('zipCode')}
              error={errors.zipCode?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Cidade *"
              placeholder="São Paulo"
              {...register('city')}
              error={errors.city?.message}
            />
            <Input
              label="Estado (UF) *"
              placeholder="SP"
              {...register('state')}
              error={errors.state?.message}
            />
            <Input
              label="Valor Padrão (R$) *"
              type="number"
              step="0.01"
              {...register('defaultRentValue', { valueAsNumber: true })}
              error={errors.defaultRentValue?.message}
            />
          </div>

          <Select
            label="Status Inicial *"
            options={[
              { label: 'Disponível', value: 'AVAILABLE' },
              { label: 'Alugado', value: 'RENTED' },
              { label: 'Inativo / Em Reforma', value: 'INACTIVE' },
            ]}
            {...register('status')}
            error={errors.status?.message}
          />

          <Input
            label="Observações"
            placeholder="Informações adicionais sobre vistorias, chaves, etc."
            {...register('notes')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Salvar Imóvel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
