import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import { contractService } from '../../services/contractService';
import { chargeService } from '../../services/chargeService';
import type { Tenant, Contract, Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ChargeStatusBadge } from '../../components/common/ChargeStatusBadge';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { User, Phone, Mail, FileText, Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const TenantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [activeTab, setActiveTab] = useState('charges');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const t = await tenantService.getById(id);
        if (!t) {
          toast.error('Inquilino não encontrado');
          navigate('/inquilinos');
          return;
        }
        setTenant(t);

        const allContracts = await contractService.getAll();
        const active = allContracts.find((c) => c.tenantId === id && (c.status === 'ACTIVE' || c.status === 'ENDING'));
        setContract(active || null);

        const allCharges = await chargeService.getAll();
        setCharges(allCharges.filter((chg) => chg.tenantId === id));
      } catch (err) {
        toast.error('Erro ao carregar perfil do inquilino');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleSendCharge = async () => {
    if (!tenant || charges.length === 0) return;
    const targetCharge = charges.find((c) => c.status === 'OVERDUE' || c.status === 'PENDING') || charges[0];
    try {
      const res = await chargeService.sendWhatsAppReminder(targetCharge.id);
      toast.success(res.message);
    } catch (err) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  if (isLoading || !tenant) {
    return <div className="p-8 text-center text-slate-500">Carregando detalhes do inquilino...</div>;
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        onClick={() => navigate('/inquilinos')}
      >
        Voltar para a lista
      </Button>

      <PageHeader
        title={tenant.name}
        description={`CPF/CNPJ: ${tenant.document} • ${tenant.email}`}
        action={
          <Button
            variant="success"
            leftIcon={<MessageCircle className="w-4 h-4" />}
            onClick={handleSendCharge}
          >
            Enviar Cobrança via WhatsApp
          </Button>
        }
        breadcrumbs={[
          { label: 'Inquilinos', href: '/inquilinos' },
          { label: tenant.name },
        ]}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase">Imóvel Atual</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
            {tenant.currentPropertyName || 'Sem imóvel vinculado'}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase">Contrato Ativo</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
            {contract ? contract.code : 'Nenhum'}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase">Valor Mensal</p>
          <p className="text-base font-bold text-emerald-600 mt-1">
            {contract ? formatCurrency(contract.rentValue) : '—'}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase">Vencimento Mensal</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
            {contract ? `Dia ${contract.dueDay}` : '—'}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'charges', label: 'Cobranças & Pagamentos', count: charges.length },
            { id: 'personal', label: 'Dados Pessoais & Contato' },
          ]}
        />

        <div className="pt-6">
          {activeTab === 'charges' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Competência</th>
                    <th className="px-4 py-3">Valor Original</th>
                    <th className="px-4 py-3">Valor Atualizado</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {charges.map((chg) => (
                    <tr key={chg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-semibold">{chg.code}</td>
                      <td className="px-4 py-3">{chg.competence}</td>
                      <td className="px-4 py-3">{formatCurrency(chg.originalValue)}</td>
                      <td className="px-4 py-3 font-bold">{formatCurrency(chg.updatedValue)}</td>
                      <td className="px-4 py-3">{formatDate(chg.dueDate)}</td>
                      <td className="px-4 py-3">
                        <ChargeStatusBadge status={chg.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/cobrancas/${chg.id}`)}
                        >
                          Ver PIX / Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <strong>Nome:</strong> {tenant.name}
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <strong>CPF/CNPJ:</strong> {tenant.document}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <strong>Nascimento:</strong> {formatDate(tenant.birthDate)}
                </p>
              </div>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <strong>Telefone:</strong> {tenant.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <strong>WhatsApp:</strong> {tenant.whatsapp}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <strong>E-mail:</strong> {tenant.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
