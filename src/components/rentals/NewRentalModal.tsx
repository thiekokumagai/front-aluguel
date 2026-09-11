import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Building2,
  User,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { propertyService } from '../../services/propertyService';
import { tenantService } from '../../services/tenantService';
import { contractService } from '../../services/contractService';
import { chargeService } from '../../services/chargeService';
import type { Property, Tenant, ReadjustmentType } from '../../types';

interface NewRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewRentalModal: React.FC<NewRentalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  // Existing lists
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Step 1: Property
  const [propertyMode, setPropertyMode] = useState<'SELECT' | 'NEW'>('SELECT');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [newProperty, setNewProperty] = useState({
    name: '',
    type: 'Casa' as Property['type'],
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Step 2: Tenant
  const [tenantMode, setTenantMode] = useState<'SELECT' | 'NEW'>('SELECT');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [showMoreTenantInfo, setShowMoreTenantInfo] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    whatsapp: '',
    document: '',
    email: '',
    birthDate: '',
    notes: '',
  });

  // Step 3: Rent details
  const [rentValue, setRentValue] = useState<number | ''>(2000);
  const [dueDay, setDueDay] = useState<number>(10);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>('');

  // Step 3 Advanced options
  const [showAdvancedRent, setShowAdvancedRent] = useState<boolean>(false);
  const [readjustmentType, setReadjustmentType] = useState<ReadjustmentType>('IPCA');
  const [finePercent, setFinePercent] = useState<number>(2);
  const [interestPercentMonth, setInterestPercentMonth] = useState<number>(1);
  const [securityDeposit, setSecurityDeposit] = useState<number | ''>('');
  const [toleranceDays, setToleranceDays] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  // Step 4: Automation
  const [autoGenerateCharges, setAutoGenerateCharges] = useState(true);
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
  const [daysBeforeDueToGenerate, setDaysBeforeDueToGenerate] = useState(3);
  const [autoSendReminderOnOverdue, setAutoSendReminderOnOverdue] = useState(true);

  // Result summary
  const [createdContractId, setCreatedContractId] = useState<string | null>(null);
  const [createdSummary, setCreatedSummary] = useState<{
    tenantName: string;
    propertyName: string;
    rentValue: number;
    dueDay: number;
    nextDueDate: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [propsList, tensList] = await Promise.all([
        propertyService.getAll(),
        tenantService.getAll(),
      ]);
      const availableProps = propsList.filter((p) => p.status === 'AVAILABLE' || !p.currentTenantId);
      setProperties(availableProps.length > 0 ? availableProps : propsList);
      setTenants(tensList);

      if (availableProps.length > 0) {
        setSelectedPropertyId(availableProps[0].id);
      } else if (propsList.length > 0) {
        setSelectedPropertyId(propsList[0].id);
      } else {
        setPropertyMode('NEW');
      }

      if (tensList.length > 0) {
        setSelectedTenantId(tensList[0].id);
      } else {
        setTenantMode('NEW');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const isFormDirty = () => {
    if (step > 1 && step < 5) return true;
    if (newProperty.name.trim() !== '') return true;
    if (newTenant.name.trim() !== '') return true;
    return false;
  };

  const handleRequestClose = () => {
    if (step === 5) {
      resetAndClose();
      return;
    }
    if (isFormDirty()) {
      setIsConfirmingDiscard(true);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setError(null);
    setIsConfirmingDiscard(false);
    setCreatedSummary(null);
    setCreatedContractId(null);
    onClose();
  };

  const handleNextStep1 = () => {
    setError(null);
    if (propertyMode === 'SELECT' && !selectedPropertyId) {
      setError('Por favor, selecione um imóvel cadastrado.');
      return;
    }
    if (propertyMode === 'NEW' && !newProperty.name.trim()) {
      setError('Por favor, informe o nome do imóvel.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setError(null);
    if (tenantMode === 'SELECT' && !selectedTenantId) {
      setError('Por favor, selecione uma pessoa cadastrada.');
      return;
    }
    if (tenantMode === 'NEW') {
      if (!newTenant.name.trim()) {
        setError('Por favor, informe o nome completo.');
        return;
      }
      if (!newTenant.whatsapp.trim()) {
        setError('Por favor, informe o WhatsApp para cobrança.');
        return;
      }
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    setError(null);
    if (!rentValue || Number(rentValue) <= 0) {
      setError('Por favor, informe um valor válido para o aluguel.');
      return;
    }
    if (!dueDay || dueDay < 1 || dueDay > 31) {
      setError('Por favor, escolha o dia do vencimento.');
      return;
    }
    if (!startDate) {
      setError('Por favor, informe a data de início.');
      return;
    }
    setStep(4);
  };

  const handleCreateRental = async () => {
    setError(null);
    setLoading(true);

    try {
      let finalProperty: Property;
      let finalTenant: Tenant;

      // 1. Get or Create Property
      if (propertyMode === 'NEW') {
        finalProperty = await propertyService.create({
          name: newProperty.name,
          type: newProperty.type,
          address: {
            street: newProperty.street,
            number: newProperty.number,
            complement: newProperty.complement,
            neighborhood: newProperty.neighborhood,
            city: newProperty.city,
            state: newProperty.state,
            zipCode: newProperty.zipCode,
          },
          defaultRentValue: Number(rentValue),
          status: 'RENTED',
        });
      } else {
        const found = properties.find((p) => p.id === selectedPropertyId);
        if (!found) throw new Error('Imóvel não encontrado.');
        finalProperty = found;
      }

      // 2. Get or Create Tenant
      if (tenantMode === 'NEW') {
        finalTenant = await tenantService.create({
          name: newTenant.name,
          whatsapp: newTenant.whatsapp,
          phone: newTenant.whatsapp,
          document: newTenant.document || '000.000.000-00',
          email: newTenant.email || '',
          birthDate: newTenant.birthDate || undefined,
          notes: newTenant.notes || undefined,
          status: 'Ativo',
        });
      } else {
        const found = tenants.find((t) => t.id === selectedTenantId);
        if (!found) throw new Error('Inquilino não encontrado.');
        finalTenant = found;
      }

      // 3. Create Contract
      const calcEndDate = hasEndDate && endDate
        ? endDate
        : new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 1)).toISOString().split('T')[0];

      const newContract = await contractService.create({
        propertyId: finalProperty.id,
        propertyName: finalProperty.name,
        tenantId: finalTenant.id,
        tenantName: finalTenant.name,
        startDate,
        endDate: calcEndDate,
        rentValue: Number(rentValue),
        dueDay,
        readjustmentType,
        finePercent,
        interestPercentMonth,
        toleranceDays,
        securityDeposit: Number(securityDeposit) || 0,
        autoGenerateCharges,
        daysBeforeDueToGenerate,
        autoSendWhatsApp,
        notes,
      });

      // 4. Create Initial Charge
      const now = new Date();
      const currentMonthStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      
      // Calculate first due date
      const dueMonth = now.getDate() > dueDay ? now.getMonth() + 1 : now.getMonth();
      const firstDue = new Date(now.getFullYear(), dueMonth, dueDay);
      const firstDueStr = firstDue.toISOString().split('T')[0];

      if (autoGenerateCharges) {
        await chargeService.create({
          tenantId: finalTenant.id,
          propertyId: finalProperty.id,
          contractId: newContract.id,
          competence: currentMonthStr,
          originalValue: Number(rentValue),
          dueDate: firstDueStr,
          finePercent,
          interestPercent: interestPercentMonth,
          description: `Aluguel - ${finalProperty.name}`,
          sendAfterCreate: autoSendWhatsApp,
        });
      }

      // Format next charge date
      const formattedNextDue = firstDue.toLocaleDateString('pt-BR');

      setCreatedContractId(newContract.id);
      setCreatedSummary({
        tenantName: finalTenant.name,
        propertyName: finalProperty.name,
        rentValue: Number(rentValue),
        dueDay,
        nextDueDate: formattedNextDue,
      });

      setStep(5);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao criar o aluguel. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Qual imóvel será alugado?';
      case 2:
        return 'Quem vai morar no imóvel?';
      case 3:
        return 'Defina o aluguel';
      case 4:
        return 'Como você quer cobrar?';
      case 5:
        return '✓ Aluguel criado com sucesso!';
      default:
        return '';
    }
  };

  const stepsList = [
    { num: 1, label: 'Imóvel' },
    { num: 2, label: 'Cliente' },
    { num: 3, label: 'Aluguel' },
    { num: 4, label: 'Cobrança' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleRequestClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-[calc(100%-16px)] sm:w-full sm:max-w-xl max-h-[95dvh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {getStepTitle()}
            </h3>
          </div>
          <button
            onClick={handleRequestClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Pills Bar */}
        {step < 5 && (
          <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {stepsList.map((st) => {
              const isActive = step === st.num;
              const isDone = step > st.num;

              return (
                <div
                  key={st.num}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black">
                    {isDone ? '✓' : st.num}
                  </span>
                  <span>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Discard Confirmation Overlay */}
        {isConfirmingDiscard ? (
          <div className="p-6 space-y-4 text-center my-auto animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Descartar novo aluguel?
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Você perderá as informações preenchidas até agora.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsConfirmingDiscard(false)}
                className="font-bold"
              >
                Continuar preenchendo
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={resetAndClose}
                className="font-bold"
              >
                Descartar
              </Button>
            </div>
          </div>
        ) : (
          /* Content Body */
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* ==================== PASSO 1: IMÓVEL ==================== */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPropertyMode('SELECT')}
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      propertyMode === 'SELECT'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Selecionar imóvel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyMode('NEW')}
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      propertyMode === 'NEW'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar novo</span>
                  </button>
                </div>

                {propertyMode === 'SELECT' ? (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Selecione o imóvel *
                    </label>
                    {properties.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                        Nenhum imóvel disponível. Escolha &quot;Cadastrar novo&quot;.
                      </p>
                    ) : (
                      <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {p.address.neighborhood || p.address.city} (R$ {p.defaultRentValue.toLocaleString('pt-BR')})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <Input
                      label="Nome do imóvel *"
                      placeholder="Ex: Casa Jardim dos Estados, Apto 102"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="CEP"
                        placeholder="00000-000"
                        value={newProperty.zipCode}
                        onChange={(e) => setNewProperty({ ...newProperty, zipCode: e.target.value })}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tipo
                        </label>
                        <select
                          value={newProperty.type}
                          onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value as Property['type'] })}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
                        >
                          <option value="Casa">Casa</option>
                          <option value="Apartamento">Apartamento</option>
                          <option value="Sala comercial">Sala comercial</option>
                          <option value="Terreno">Terreno</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Input
                          label="Endereço"
                          placeholder="Rua / Avenida"
                          value={newProperty.street}
                          onChange={(e) => setNewProperty({ ...newProperty, street: e.target.value })}
                        />
                      </div>
                      <Input
                        label="Número"
                        placeholder="123"
                        value={newProperty.number}
                        onChange={(e) => setNewProperty({ ...newProperty, number: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Bairro"
                        placeholder="Bairro"
                        value={newProperty.neighborhood}
                        onChange={(e) => setNewProperty({ ...newProperty, neighborhood: e.target.value })}
                      />
                      <Input
                        label="Cidade"
                        placeholder="Cidade"
                        value={newProperty.city}
                        onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                      />
                      <Input
                        label="UF"
                        placeholder="SP"
                        value={newProperty.state}
                        onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== PASSO 2: INQUILINO ==================== */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTenantMode('SELECT')}
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      tenantMode === 'SELECT'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Selecionar cliente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenantMode('NEW')}
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      tenantMode === 'NEW'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar novo</span>
                  </button>
                </div>

                {tenantMode === 'SELECT' ? (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Selecione o cliente *
                    </label>
                    {tenants.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                        Nenhum cliente cadastrado. Escolha &quot;Cadastrar novo&quot;.
                      </p>
                    ) : (
                      <select
                        value={selectedTenantId}
                        onChange={(e) => setSelectedTenantId(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        {tenants.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.whatsapp || t.phone})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <Input
                      label="Nome completo *"
                      placeholder="Ex: Carlos Silva"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="WhatsApp *"
                        placeholder="(11) 99999-9999"
                        value={newTenant.whatsapp}
                        onChange={(e) => setNewTenant({ ...newTenant, whatsapp: e.target.value })}
                      />
                      <Input
                        label="CPF / CNPJ"
                        placeholder="000.000.000-00"
                        value={newTenant.document}
                        onChange={(e) => setNewTenant({ ...newTenant, document: e.target.value })}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMoreTenantInfo(!showMoreTenantInfo)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      {showMoreTenantInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>+ Mais informações</span>
                    </button>

                    {showMoreTenantInfo && (
                      <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
                        <Input
                          label="E-mail (opcional)"
                          type="email"
                          placeholder="exemplo@email.com"
                          value={newTenant.email}
                          onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                        />
                        <Input
                          label="Data de nascimento (opcional)"
                          type="date"
                          value={newTenant.birthDate}
                          onChange={(e) => setNewTenant({ ...newTenant, birthDate: e.target.value })}
                        />
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Observações
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Anotações sobre a pessoa..."
                            value={newTenant.notes}
                            onChange={(e) => setNewTenant({ ...newTenant, notes: e.target.value })}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==================== PASSO 3: ALUGUEL ==================== */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Valor do aluguel *"
                    type="number"
                    placeholder="2000"
                    value={rentValue}
                    onChange={(e) => setRentValue(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Vencimento todo dia *
                    </label>
                    <select
                      value={dueDay}
                      onChange={(e) => setDueDay(Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
                    >
                      {[1, 5, 8, 10, 15, 20, 25, 28, 30].map((day) => (
                        <option key={day} value={day}>
                          Dia {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Início do aluguel *"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tem data para terminar?
                    </label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="endDateRadio"
                          checked={!hasEndDate}
                          onChange={() => setHasEndDate(false)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Não</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="endDateRadio"
                          checked={hasEndDate}
                          onChange={() => setHasEndDate(true)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Sim</span>
                      </label>
                    </div>
                  </div>
                </div>

                {hasEndDate && (
                  <Input
                    label="Data final do contrato *"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                )}

                {/* Accordion Opções Avançadas */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedRent(!showAdvancedRent)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>Opções avançadas (reajuste, multa, juros, caução)</span>
                    {showAdvancedRent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvancedRent && (
                    <div className="p-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Reajuste anual
                          </label>
                          <select
                            value={readjustmentType}
                            onChange={(e) => setReadjustmentType(e.target.value as ReadjustmentType)}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
                          >
                            <option value="IPCA">IPCA</option>
                            <option value="IGP-M">IGP-M</option>
                            <option value="Manual">Manual</option>
                            <option value="Sem reajuste">Sem reajuste</option>
                          </select>
                        </div>
                        <Input
                          label="Caução (R$)"
                          type="number"
                          placeholder="0"
                          value={securityDeposit}
                          onChange={(e) => setSecurityDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Multa (%)"
                          type="number"
                          value={finePercent}
                          onChange={(e) => setFinePercent(Number(e.target.value))}
                        />
                        <Input
                          label="Juros/mês (%)"
                          type="number"
                          value={interestPercentMonth}
                          onChange={(e) => setInterestPercentMonth(Number(e.target.value))}
                        />
                        <Input
                          label="Tolerância (dias)"
                          type="number"
                          value={toleranceDays}
                          onChange={(e) => setToleranceDays(Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Observações adicionais (opcional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ex: Cláusulas ou observações do aluguel..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== PASSO 4: COBRANÇA AUTOMÁTICA ==================== */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoGenerateCharges}
                      onChange={(e) => setAutoGenerateCharges(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Gerar cobrança automática todo mês
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        O sistema cria o PIX e a cobrança sem você precisar se preocupar.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <input
                      type="checkbox"
                      checked={autoSendWhatsApp}
                      onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Enviar pelo WhatsApp
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">Enviar com antecedência de:</span>
                        <select
                          value={daysBeforeDueToGenerate}
                          onChange={(e) => setDaysBeforeDueToGenerate(Number(e.target.value))}
                          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                        >
                          <option value={1}>1 dia antes</option>
                          <option value={3}>3 dias antes</option>
                          <option value={5}>5 dias antes</option>
                          <option value={10}>10 dias antes</option>
                        </select>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <input
                      type="checkbox"
                      checked={autoSendReminderOnOverdue}
                      onChange={(e) => setAutoSendReminderOnOverdue(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Enviar lembrete de atraso automaticamente
                      </span>
                      <p className="text-xs text-slate-500">
                        Caso o inquilino atrase, enviamos uma mensagem educada de lembrete.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Resumo do Aluguel */}
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      Resumo do Novo Aluguel
                    </span>
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-sm space-y-1 text-slate-800 dark:text-slate-200">
                    <p className="font-bold text-base">
                      {tenantMode === 'NEW' ? newTenant.name : tenants.find((t) => t.id === selectedTenantId)?.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {propertyMode === 'NEW' ? newProperty.name : properties.find((p) => p.id === selectedPropertyId)?.name}
                    </p>
                    <div className="pt-2 flex justify-between items-center text-sm">
                      <span className="font-extrabold text-blue-700 dark:text-blue-400 text-lg">
                        R$ {Number(rentValue).toLocaleString('pt-BR')}/mês
                      </span>
                      <span className="text-xs font-semibold bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                        Vencimento todo dia {dueDay}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== PASSO 5: SUCESSO ==================== */}
            {step === 5 && createdSummary && (
              <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    ✓ Aluguel criado com sucesso!
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Tudo pronto. As cobranças e notificações estão configuradas.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-left max-w-md mx-auto space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {createdSummary.tenantName}
                      </h5>
                      <p className="text-xs text-slate-500">{createdSummary.propertyName}</p>
                    </div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">
                      R$ {createdSummary.rentValue.toLocaleString('pt-BR')}/mês
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Vencimento todo dia {createdSummary.dueDay}</span>
                    <span>Próxima cobrança: {createdSummary.nextDueDate}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-semibold max-w-md mx-auto text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/40">
                  {autoGenerateCharges && <p className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Cobrança automática ativada</p>}
                  {autoSendWhatsApp && <p className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Envio pelo WhatsApp ativado</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Buttons */}
        {!isConfirmingDiscard && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {step > 1 && step < 5 ? (
              <Button
                variant="outline"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep((step - 1) as any)}
                disabled={loading}
                className="font-semibold"
              >
                Voltar
              </Button>
            ) : step === 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleRequestClose}
                className="font-semibold text-slate-500"
              >
                Cancelar
              </Button>
            ) : (
              <div />
            )}

            {step === 1 && (
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNextStep1}
                className="font-bold"
              >
                Continuar
              </Button>
            )}

            {step === 2 && (
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNextStep2}
                className="font-bold"
              >
                Continuar
              </Button>
            )}

            {step === 3 && (
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNextStep3}
                className="font-bold"
              >
                Continuar
              </Button>
            )}

            {step === 4 && (
              <Button
                variant="primary"
                size="lg"
                isLoading={loading}
                rightIcon={<Check className="w-5 h-5" />}
                onClick={handleCreateRental}
                className="px-6 font-bold shadow-md shadow-blue-600/20"
              >
                Começar aluguel
              </Button>
            )}

            {step === 5 && (
              <div className="flex items-center gap-2 w-full justify-end">
                {createdContractId && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      const cId = createdContractId;
                      resetAndClose();
                      navigate(`/alugueis/${cId}`);
                    }}
                    className="font-bold text-xs"
                  >
                    Ver aluguel
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="md"
                  onClick={resetAndClose}
                  className="font-bold text-xs px-6"
                >
                  Concluir
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
