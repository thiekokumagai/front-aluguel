import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { chargeService } from '../../services/chargeService';
import { tenantService } from '../../services/tenantService';
import { propertyService } from '../../services/propertyService';
import { contractService } from '../../services/contractService';
import type { Tenant, Property, Contract } from '../../types';
import { toast } from 'sonner';

interface NewChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewChargeModal: React.FC<NewChargeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const [tenantId, setTenantId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [contractId, setContractId] = useState('');
  const [competence, setCompetence] = useState('09/2026');
  const [value, setValue] = useState<number>(1800);
  const [dueDate, setDueDate] = useState<string>('2026-09-10');
  const [finePercent, setFinePercent] = useState<number>(2);
  const [interestPercent, setInterestPercent] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [sendAfterCreate, setSendAfterCreate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      tenantService.getAll().then(setTenants);
      propertyService.getAll().then(setProperties);
      contractService.getAll().then(setContracts);
    }
  }, [isOpen]);

  const handleTenantChange = (tId: string) => {
    setTenantId(tId);
    const tenant = tenants.find((t) => t.id === tId);
    if (tenant?.currentPropertyId) {
      setPropertyId(tenant.currentPropertyId);
      const prop = properties.find((p) => p.id === tenant.currentPropertyId);
      if (prop) setValue(prop.defaultRentValue);
    }
    if (tenant?.currentContractId) {
      setContractId(tenant.currentContractId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !propertyId) {
      toast.error('Selecione um inquilino e imóvel');
      return;
    }
    try {
      setIsLoading(true);
      await chargeService.create({
        tenantId,
        propertyId,
        contractId: contractId || 'ctr-1',
        competence,
        originalValue: Number(value),
        dueDate,
        finePercent: Number(finePercent),
        interestPercent: Number(interestPercent),
        description,
        sendAfterCreate,
      });
      toast.success(
        sendAfterCreate
          ? 'Cobrança gerada e enviada via WhatsApp!'
          : 'Cobrança gerada com sucesso!'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error('Erro ao gerar cobrança');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="+ Nova Cobrança" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Inquilino *"
          value={tenantId}
          onChange={(e) => handleTenantChange(e.target.value)}
          options={tenants.map((t) => ({ label: `${t.name} (${t.document})`, value: t.id }))}
          placeholder="Selecione o inquilino..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Imóvel *"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            options={properties.map((p) => ({ label: p.name, value: p.id }))}
            placeholder="Selecione o imóvel..."
          />

          <Select
            label="Contrato"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            options={contracts.map((c) => ({ label: `${c.code} (${c.tenantName})`, value: c.id }))}
            placeholder="Selecione o contrato..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Competência *"
            value={competence}
            onChange={(e) => setCompetence(e.target.value)}
            placeholder="MM/AAAA"
          />

          <Input
            label="Valor (R$) *"
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />

          <Input
            label="Data Vencimento *"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Multa padrão (%)"
            type="number"
            value={finePercent}
            onChange={(e) => setFinePercent(Number(e.target.value))}
          />

          <Input
            label="Juros ao mês (%)"
            type="number"
            value={interestPercent}
            onChange={(e) => setInterestPercent(Number(e.target.value))}
          />
        </div>

        <Input
          label="Descrição / Observação"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Aluguel referente a Setembro/2026"
        />

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="sendAfterCreate"
            checked={sendAfterCreate}
            onChange={(e) => setSendAfterCreate(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
          />
          <label htmlFor="sendAfterCreate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Enviar cobrança por WhatsApp após criar
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Gerar Cobrança
          </Button>
        </div>
      </form>
    </Modal>
  );
};
