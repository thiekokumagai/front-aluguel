import React, { useState, useEffect } from 'react';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, Plus, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenantSchema, type TenantFormData } from '../../schemas/tenantSchema';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const TenantsListPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadTenants = async () => {
    try {
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (err) {
      toast.error('Erro ao carregar inquilinos');
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
  });

  const onAddTenant = async (data: TenantFormData) => {
    try {
      await tenantService.create({
        name: data.name,
        document: data.document,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        birthDate: data.birthDate,
        notes: data.notes,
      });
      toast.success('Inquilino cadastrado com sucesso!');
      setIsModalOpen(false);
      reset();
      loadTenants();
    } catch (err) {
      toast.error('Erro ao cadastrar inquilino');
    }
  };

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.document.includes(search) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquilinos"
        description="Controle todos os locatários e contatos diretos."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Novo inquilino
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar inquilino por nome, CPF/CNPJ ou e-mail..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'Todos os status', value: 'ALL' },
              { label: 'Ativo', value: 'Ativo' },
              { label: 'Sem contrato', value: 'Sem contrato' },
              { label: 'Inativo', value: 'Inativo' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="Nenhum inquilino encontrado"
            description="Tente mudar os filtros ou adicione um novo locatário."
            actionLabel="+ Novo Inquilino"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Nome</th>
                  <th className="px-4 py-3.5">CPF / CNPJ</th>
                  <th className="px-4 py-3.5">Contato</th>
                  <th className="px-4 py-3.5">Imóvel Atual</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {t.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {t.document}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-900 dark:text-slate-100">{t.phone}</p>
                      <p className="text-xs text-slate-400">{t.email}</p>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {t.currentPropertyName || <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                          t.status === 'Ativo'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/inquilinos/${t.id}`)}
                      >
                        Ver Perfil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Tenant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="+ Novo Inquilino"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onAddTenant)} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Ex: Carlos Alberto Silva"
            {...register('name')}
            error={errors.name?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CPF ou CNPJ *"
              placeholder="000.000.000-00"
              {...register('document')}
              error={errors.document?.message}
            />
            <Input
              label="Data de Nascimento"
              type="date"
              {...register('birthDate')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefone *"
              placeholder="(11) 98765-4321"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <Input
              label="WhatsApp *"
              placeholder="(11) 98765-4321"
              {...register('whatsapp')}
              error={errors.whatsapp?.message}
            />
          </div>

          <Input
            label="E-mail *"
            type="email"
            placeholder="carlos@email.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Observações"
            placeholder="Informações adicionais, fiador, referências..."
            {...register('notes')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Salvar Inquilino
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
