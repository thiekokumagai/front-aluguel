import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import type { Property } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusFilter } from '../../components/ui/StatusFilter';
import {
  Search,
  Plus,
  ChevronRight,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

export const PropertiesListPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'RENTED' | 'AVAILABLE' | 'INACTIVE'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // New Property Modal
  const [isNewPropertyOpen, setIsNewPropertyOpen] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<Property['type']>('Casa');
  const [newPropStreet, setNewPropStreet] = useState('');
  const [newPropNumber, setNewPropNumber] = useState('');
  const [newPropNeighborhood, setNewPropNeighborhood] = useState('');
  const [newPropCity, setNewPropCity] = useState('');
  const [newPropState, setNewPropState] = useState('');
  const [newPropRent, setNewPropRent] = useState<number | ''>(2000);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { openNewRentalModal } = useOutletContext<{ openNewRentalModal: () => void }>() || {
    openNewRentalModal: () => {},
  };

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const list = await propertyService.getAll();
      setProperties(list);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar imóveis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim()) {
      toast.error('Informe o nome do imóvel.');
      return;
    }

    setIsSaving(true);
    try {
      await propertyService.create({
        name: newPropName.trim(),
        type: newPropType,
        address: {
          street: newPropStreet.trim() || 'Rua Principal',
          number: newPropNumber.trim() || '123',
          neighborhood: newPropNeighborhood.trim() || 'Centro',
          city: newPropCity.trim() || 'São Paulo',
          state: newPropState.trim() || 'SP',
          zipCode: '00000-000',
        },
        defaultRentValue: Number(newPropRent) || 2000,
        status: 'AVAILABLE',
      });
      toast.success('Imóvel cadastrado com sucesso!');
      setIsNewPropertyOpen(false);
      setNewPropName('');
      setNewPropStreet('');
      setNewPropNumber('');
      setNewPropNeighborhood('');
      setNewPropCity('');
      setNewPropState('');
      loadProperties();
    } catch (err) {
      toast.error('Erro ao cadastrar imóvel.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalCount = properties.length;
  const rentedCount = properties.filter((p) => p.status === 'RENTED').length;
  const availableCount = properties.filter((p) => p.status === 'AVAILABLE').length;
  const inactiveCount = properties.filter((p) => p.status === 'INACTIVE').length;

  const filteredProperties = properties.filter((p) => {
    const fullAddress = `${p.address.street} ${p.address.neighborhood} ${p.address.city}`.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullAddress.includes(searchTerm.toLowerCase()) ||
      (p.currentTenantName || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'RENTED') return p.status === 'RENTED';
    if (filter === 'AVAILABLE') return p.status === 'AVAILABLE';
    if (filter === 'INACTIVE') return p.status === 'INACTIVE';
    return true;
  });

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Meus imóveis
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Veja seus imóveis alugados e disponíveis.
            </p>

            {/* Resumo Simples no Topo */}
            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{totalCount} imóveis</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400">{rentedCount} alugados</span>
              <span>•</span>
              <span className="text-blue-600 dark:text-blue-400">{availableCount} disponível</span>
              <span>•</span>
              <span className="text-slate-400">{inactiveCount} inativo</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            fullWidthMobile
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewPropertyOpen(true)}
            className="font-bold shadow-xs shadow-blue-600/20"
          >
            + Novo imóvel
          </Button>
        </div>

        {/* Busca & Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar imóvel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <StatusFilter
            options={[
              { label: 'Todos', value: 'ALL' },
              { label: 'Alugados', value: 'RENTED' },
              { label: 'Disponíveis', value: 'AVAILABLE' },
              { label: 'Inativos', value: 'INACTIVE' },
            ]}
            value={filter}
            onChange={(val) => setFilter(val as 'ALL' | 'RENTED' | 'AVAILABLE' | 'INACTIVE')}
          />
        </div>

        {/* Lista de Imóveis */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <p className="text-slate-500 text-xs sm:text-sm">Nenhum imóvel encontrado.</p>
            <Button size="sm" variant="primary" onClick={() => setIsNewPropertyOpen(true)}>
              + Cadastrar imóvel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProperties.map((p) => (
              <div
                key={p.id}
                className="p-4 sm:px-6 sm:py-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                {/* Nome e Endereço */}
                <div
                  className="space-y-1.5 cursor-pointer flex-1"
                  onClick={() => navigate(`/imoveis/${p.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-normal hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {p.name}
                    </h3>
                    {p.status === 'RENTED' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        Alugado
                      </span>
                    )}
                    {p.status === 'AVAILABLE' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                        Disponível
                      </span>
                    )}
                    {p.status === 'INACTIVE' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Inativo
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {p.address.street}, {p.address.number} {p.address.neighborhood ? `- ${p.address.neighborhood}` : ''}
                  </p>

                  {p.status === 'RENTED' && p.currentTenantName && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {p.currentTenantName} • {formatCurrency(p.defaultRentValue)}/mês
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  {p.status === 'AVAILABLE' ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<KeyRound className="w-4 h-4" />}
                        onClick={openNewRentalModal}
                        className="font-bold text-xs shadow-xs"
                      >
                        Iniciar aluguel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                        onClick={() => navigate(`/imoveis/${p.id}`)}
                        className="font-semibold text-xs"
                      >
                        Ver imóvel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                      onClick={() => navigate(`/imoveis/${p.id}`)}
                      className="font-semibold text-xs"
                      fullWidthMobile
                    >
                      Ver imóvel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Modal + Novo Imóvel */}
      <Modal
        isOpen={isNewPropertyOpen}
        onClose={() => setIsNewPropertyOpen(false)}
        title="Cadastrar Novo Imóvel"
        maxWidth="md"
      >
        <form onSubmit={handleCreateProperty} className="space-y-4 p-2">
          <Input
            label="Nome do imóvel *"
            placeholder="Ex: Casa Jardim dos Estados, Apto 102"
            value={newPropName}
            onChange={(e) => setNewPropName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              value={newPropType}
              onChange={(e) => setNewPropType(e.target.value as Property['type'])}
              options={[
                { label: 'Casa', value: 'Casa' },
                { label: 'Apartamento', value: 'Apartamento' },
                { label: 'Sala comercial', value: 'Sala comercial' },
                { label: 'Terreno', value: 'Terreno' },
                { label: 'Outro', value: 'Outro' },
              ]}
            />
            <Input
              label="Valor padrão do aluguel (R$)"
              type="number"
              value={newPropRent}
              onChange={(e) => setNewPropRent(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Rua / Avenida"
                placeholder="Rua das Palmeiras"
                value={newPropStreet}
                onChange={(e) => setNewPropStreet(e.target.value)}
              />
            </div>
            <Input
              label="Número"
              placeholder="450"
              value={newPropNumber}
              onChange={(e) => setNewPropNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Bairro"
              placeholder="Jardim dos Estados"
              value={newPropNeighborhood}
              onChange={(e) => setNewPropNeighborhood(e.target.value)}
            />
            <Input
              label="Cidade"
              placeholder="São Paulo"
              value={newPropCity}
              onChange={(e) => setNewPropCity(e.target.value)}
            />
            <Input
              label="UF"
              placeholder="SP"
              value={newPropState}
              onChange={(e) => setNewPropState(e.target.value)}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewPropertyOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} className="font-bold">
              Cadastrar imóvel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </PageContainer>
  );
};
