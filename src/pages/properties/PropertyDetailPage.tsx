import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { contractService } from '../../services/contractService';
import type { Property, Contract } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  ChevronRight,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editRent, setEditRent] = useState<number | ''>(2000);
  const [isSaving, setIsSaving] = useState(false);

  const loadPropertyDetail = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [p, allContracts] = await Promise.all([
        propertyService.getById(id),
        contractService.getAll(),
      ]);

      if (!p) {
        toast.error('Imóvel não encontrado.');
        navigate('/imoveis');
        return;
      }

      setProperty(p);
      setContracts(allContracts.filter((c) => c.propertyId === p.id));

      setEditName(p.name);
      setEditStreet(p.address.street);
      setEditNumber(p.address.number);
      setEditRent(p.defaultRentValue);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar detalhes do imóvel.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyDetail();
  }, [id]);

  const handleUpdateStatus = async (status: Property['status']) => {
    if (!property) return;
    try {
      await propertyService.update(property.id, { status });
      toast.success('Status do imóvel atualizado!');
      setShowMoreMenu(false);
      loadPropertyDetail();
    } catch (err) {
      toast.error('Erro ao atualizar status do imóvel.');
    }
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setIsSaving(true);
    try {
      await propertyService.update(property.id, {
        name: editName,
        address: { ...property.address, street: editStreet, number: editNumber },
        defaultRentValue: Number(editRent) || property.defaultRentValue,
      });
      toast.success('Imóvel atualizado!');
      setIsEditOpen(false);
      loadPropertyDetail();
    } catch (err) {
      toast.error('Erro ao atualizar imóvel.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !property) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </PageContainer>
    );
  }

  const activeContract = contracts.find((c) => c.status === 'ACTIVE' || c.status === 'ENDING');

  // Simulated previous tenant history
  const historicalTenants = [
    ...(activeContract
      ? [{ name: activeContract.tenantName, period: '2025 - atual', active: true, contractId: activeContract.id }]
      : []),
    { name: 'João Oliveira', period: '2023 - 2024', active: false },
  ];

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/imoveis')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para imóveis</span>
        </button>

        {/* Cartão de Detalhe Principal do Imóvel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {property.name}
                </h1>
                {property.status === 'RENTED' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    🟢 Alugado
                  </span>
                )}
                {property.status === 'AVAILABLE' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                    🔵 Disponível
                  </span>
                )}
                {property.status === 'INACTIVE' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ⚪ Inativo
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">
                Endereço: {property.address.street}, {property.address.number} {property.address.neighborhood ? `- ${property.address.neighborhood}` : ''}, {property.address.city}/{property.address.state}
              </p>
            </div>

            {/* Barra de Ações */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="md"
                variant="outline"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => setIsEditOpen(true)}
                className="font-bold text-xs"
              >
                Editar imóvel
              </Button>

              {property.status === 'AVAILABLE' && (
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => handleUpdateStatus('INACTIVE')}
                  className="font-bold text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Inativar imóvel
                </Button>
              )}

              {property.status === 'INACTIVE' && (
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => handleUpdateStatus('AVAILABLE')}
                  className="font-bold text-xs"
                >
                  Ativar imóvel
                </Button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-sm font-semibold cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => handleUpdateStatus('AVAILABLE')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      Marcar como disponível
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('INACTIVE')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      Marcar como inativo
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        toast.info('Exibindo histórico de locatários abaixo.');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      Ver histórico
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* Seção Aluguel Atual */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Aluguel atual
        </h2>

        {activeContract ? (
          <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {activeContract.tenantName}
              </p>
              <p className="text-xs text-slate-500">
                Vencimento dia {activeContract.dueDay}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {formatCurrency(activeContract.rentValue)}
                  <span className="text-xs font-normal text-slate-400">/mês</span>
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                rightIcon={<ChevronRight className="w-4 h-4" />}
                onClick={() => navigate(`/alugueis/${activeContract.id}`)}
                className="font-bold text-xs"
              >
                Ver aluguel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4">Este imóvel não possui nenhum aluguel ativo no momento.</p>
        )}
      </div>

      {/* Seção Histórico de Locatários */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <span>Histórico de locatários</span>
        </h2>

        <div className="space-y-3">
          {historicalTenants.map((h, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {h.name}
                </p>
                <p className="text-xs text-slate-400">{h.period}</p>
              </div>

              {h.active ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200">
                  Atual
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  Encerrado
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Editar Imóvel */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Imóvel"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateProperty} className="space-y-4 p-2">
          <Input
            label="Nome do imóvel"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Endereço"
                value={editStreet}
                onChange={(e) => setEditStreet(e.target.value)}
              />
            </div>
            <Input
              label="Número"
              value={editNumber}
              onChange={(e) => setEditNumber(e.target.value)}
            />
          </div>
          <Input
            label="Valor padrão do aluguel (R$)"
            type="number"
            value={editRent}
            onChange={(e) => setEditRent(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} className="font-bold">
              Salvar alterações
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </PageContainer>
  );
};
