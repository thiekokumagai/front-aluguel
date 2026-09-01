import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { contractService } from '../../services/contractService';
import { chargeService } from '../../services/chargeService';
import type { Property, Contract, Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PropertyStatusBadge } from '../../components/common/PropertyStatusBadge';
import { ChargeStatusBadge } from '../../components/common/ChargeStatusBadge';
import { ContractStatusBadge } from '../../components/common/ContractStatusBadge';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { User, FileText, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [activeTab, setActiveTab] = useState('charges');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const prop = await propertyService.getById(id);
        if (!prop) {
          toast.error('Imóvel não encontrado');
          navigate('/imoveis');
          return;
        }
        setProperty(prop);

        const allContracts = await contractService.getAll();
        setContracts(allContracts.filter((c) => c.propertyId === id));

        const allCharges = await chargeService.getAll();
        setCharges(allCharges.filter((c) => c.propertyId === id));
      } catch (err) {
        toast.error('Erro ao carregar detalhes do imóvel');
      } flex: {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  if (isLoading || !property) {
    return <div className="p-8 text-center text-slate-500">Carregando detalhes do imóvel...</div>;
  }

  const activeContract = contracts.find((c) => c.status === 'ACTIVE' || c.status === 'ENDING');

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        onClick={() => navigate('/imoveis')}
      >
        Voltar para a lista
      </Button>

      <PageHeader
        title={`${property.name} (${property.code})`}
        description={`${property.address.street}, ${property.address.number} - ${property.address.neighborhood}, ${property.address.city}/${property.address.state}`}
        action={<PropertyStatusBadge status={property.status} className="text-sm px-3 py-1" />}
        breadcrumbs={[
          { label: 'Imóveis', href: '/imoveis' },
          { label: property.code },
        ]}
      />

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Inquilino Atual</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {property.currentTenantName || 'Nenhum inquilino'}
            </p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Valor do Aluguel</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatCurrency(activeContract?.rentValue || property.defaultRentValue)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Dia do Vencimento</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {activeContract ? `Dia ${activeContract.dueDay} de cada mês` : '—'}
            </p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Contrato Ativo</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {activeContract ? activeContract.code : 'Sem contrato'}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs section */}
      <Card>
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'charges', label: 'Histórico de Cobranças', count: charges.length },
            { id: 'contracts', label: 'Histórico de Contratos', count: contracts.length },
            { id: 'details', label: 'Dados do Imóvel' },
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
                    <th className="px-4 py-3">Valor Atualizado</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {charges.map((chg) => (
                    <tr key={chg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-semibold">{chg.code}</td>
                      <td className="px-4 py-3">{chg.competence}</td>
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
                          Ver Cobrança
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Contrato</th>
                    <th className="px-4 py-3">Inquilino</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                      <td className="px-4 py-3 font-semibold">{c.tenantName}</td>
                      <td className="px-4 py-3">
                        {formatDate(c.startDate)} até {formatDate(c.endDate)}
                      </td>
                      <td className="px-4 py-3 font-bold">{formatCurrency(c.rentValue)}</td>
                      <td className="px-4 py-3">
                        <ContractStatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p><strong className="text-slate-500">Tipo:</strong> {property.type}</p>
                <p><strong className="text-slate-500">CEP:</strong> {property.address.zipCode}</p>
                <p><strong className="text-slate-500">Logradouro:</strong> {property.address.street}, {property.address.number}</p>
                <p><strong className="text-slate-500">Complemento:</strong> {property.address.complement || '—'}</p>
              </div>
              <div className="space-y-2">
                <p><strong className="text-slate-500">Bairro:</strong> {property.address.neighborhood}</p>
                <p><strong className="text-slate-500">Cidade/UF:</strong> {property.address.city} / {property.address.state}</p>
                <p><strong className="text-slate-500">Observações:</strong> {property.notes || 'Nenhuma observação.'}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
