import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import { contractService } from '../../services/contractService';
import { chargeService } from '../../services/chargeService';
import type { Tenant, Contract, Charge } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusFilter } from '../../components/ui/StatusFilter';
import {
  Search,
  Plus,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export const ClientsListPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'WITH_RENT' | 'NO_RENT'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // New Client Modal
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientWhatsapp, setNewClientWhatsapp] = useState('');
  const [newClientDocument, setNewClientDocument] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tensList, ctrList, chgList] = await Promise.all([
        tenantService.getAll(),
        contractService.getAll(),
        chargeService.getAll(),
      ]);
      setTenants(tensList);
      setContracts(ctrList);
      setCharges(chgList);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar lista de clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientWhatsapp.trim()) {
      toast.error('Informe ao menos Nome e WhatsApp do cliente.');
      return;
    }

    setIsSaving(true);
    try {
      await tenantService.create({
        name: newClientName.trim(),
        whatsapp: newClientWhatsapp.trim(),
        phone: newClientWhatsapp.trim(),
        document: newClientDocument.trim() || '000.000.000-00',
        email: newClientEmail.trim() || '',
        status: 'Sem contrato',
      });
      toast.success('Cliente cadastrado com sucesso!');
      setIsNewClientOpen(false);
      setNewClientName('');
      setNewClientWhatsapp('');
      setNewClientDocument('');
      setNewClientEmail('');
      loadData();
    } catch (err) {
      toast.error('Erro ao cadastrar cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Combine tenant with their contract and charge status
  const clientCards = tenants.map((t) => {
    const activeContract = contracts.find((c) => c.tenantId === t.id && (c.status === 'ACTIVE' || c.status === 'ENDING'));
    const relatedCharges = charges.filter((ch) => ch.tenantId === t.id);
    const latestCharge = relatedCharges[0] || null;

    let statusType: 'OK' | 'OVERDUE' | 'NONE' = 'NONE';
    if (activeContract) {
      statusType = latestCharge?.status === 'OVERDUE' ? 'OVERDUE' : 'OK';
    }

    return {
      tenant: t,
      contract: activeContract || null,
      latestCharge,
      statusType,
    };
  });

  const filteredClients = clientCards.filter(({ tenant, contract }) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.whatsapp.includes(searchTerm) ||
      (contract?.propertyName || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'WITH_RENT') return !!contract;
    if (filter === 'NO_RENT') return !contract;
    return true;
  });

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Clientes
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Pessoas que alugam seus imóveis.
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            fullWidthMobile
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewClientOpen(true)}
            className="font-bold shadow-xs shadow-blue-600/20"
          >
            + Novo cliente
          </Button>
        </div>

        {/* Busca & Filtros Simples */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <StatusFilter
            options={[
              { label: 'Todos', value: 'ALL' },
              { label: 'Com aluguel', value: 'WITH_RENT' },
              { label: 'Sem aluguel', value: 'NO_RENT' },
            ]}
            value={filter}
            onChange={(val) => setFilter(val as 'ALL' | 'WITH_RENT' | 'NO_RENT')}
          />
        </div>

        {/* Listagem de Cards de Clientes */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <p className="text-slate-500 text-xs sm:text-sm">Nenhum cliente encontrado.</p>
            <Button size="sm" variant="primary" onClick={() => setIsNewClientOpen(true)}>
              + Cadastrar novo cliente
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map(({ tenant, contract, statusType }) => (
              <div
                key={tenant.id}
                className="p-4 sm:px-6 sm:py-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                {/* Infos básicas */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-normal">
                    {tenant.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{tenant.whatsapp || tenant.phone}</span>
                    </span>
                    {contract && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>Imóvel: <strong className="font-bold text-slate-700 dark:text-slate-200">{contract.propertyName}</strong></span>
                      </>
                    )}
                    {!contract && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="italic text-slate-400">Sem aluguel ativo</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Valor e Status */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2.5 sm:pt-0">
                  {contract && (
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                        {formatCurrency(contract.rentValue)}
                        <span className="text-xs font-normal text-slate-400">/mês</span>
                      </p>
                      <div className="mt-0.5">
                        {statusType === 'OK' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Em dia
                          </span>
                        )}
                        {statusType === 'OVERDUE' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> Aluguel atrasado
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => navigate(`/clientes/${tenant.id}`)}
                    className="font-semibold text-xs"
                    fullWidthMobile
                  >
                    Ver cliente
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Modal + Novo Cliente */}
      <Modal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        title="Cadastrar Novo Cliente"
        maxWidth="md"
      >
        <form onSubmit={handleCreateClient} className="space-y-4 p-2">
          <Input
            label="Nome completo *"
            placeholder="Ex: Carlos Silva"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
          />
          <Input
            label="WhatsApp *"
            placeholder="(67) 99999-9999"
            value={newClientWhatsapp}
            onChange={(e) => setNewClientWhatsapp(e.target.value)}
          />
          <Input
            label="CPF / CNPJ (opcional)"
            placeholder="000.000.000-00"
            value={newClientDocument}
            onChange={(e) => setNewClientDocument(e.target.value)}
          />
          <Input
            label="E-mail (opcional)"
            type="email"
            placeholder="cliente@email.com"
            value={newClientEmail}
            onChange={(e) => setNewClientEmail(e.target.value)}
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewClientOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} className="font-bold">
              Cadastrar cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </PageContainer>
  );
};
