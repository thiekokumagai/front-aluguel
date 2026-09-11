import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { contractService } from '../../services/contractService';
import { chargeService } from '../../services/chargeService';
import type { Contract } from '../../types';

interface SendExtraChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultContractId?: string;
}

export const SendExtraChargeModal: React.FC<SendExtraChargeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultContractId,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState(defaultContractId || '');
  const [value, setValue] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadContracts();
    }
  }, [isOpen]);

  const loadContracts = async () => {
    try {
      const list = await contractService.getAll();
      const active = list.filter((c) => c.status === 'ACTIVE' || c.status === 'ENDING');
      setContracts(active);
      if (!selectedContractId && active.length > 0) {
        setSelectedContractId(active[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedContractId) {
      setError('Selecione um aluguel para cobrança.');
      return;
    }

    if (!value || Number(value) <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    if (!dueDate) {
      setError('Informe a data de vencimento.');
      return;
    }

    setLoading(true);
    try {
      const contract = contracts.find((c) => c.id === selectedContractId);
      if (!contract) throw new Error('Aluguel não encontrado.');

      const now = new Date();
      const currentMonthStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

      await chargeService.create({
        tenantId: contract.tenantId,
        propertyId: contract.propertyId,
        contractId: contract.id,
        competence: currentMonthStr,
        originalValue: Number(value),
        dueDate,
        description: description.trim() || `Cobrança extra - ${contract.propertyName}`,
        sendAfterCreate: sendWhatsApp,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar cobrança extra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>Enviar cobrança extra</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Para quem? *
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tenantName} — {c.propertyName} (Aluguel dia {c.dueDay})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Valor (R$) *"
              type="number"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Vencimento *"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              placeholder="Ex: Água, reparo, aluguel adicional..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
            />
          </div>

          <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
            <input
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Enviar notificação pelo WhatsApp</span>
            </div>
          </label>

          <p className="text-xs text-slate-400">
            Multa e juros serão aplicados automaticamente caso a cobrança atrase, de acordo com o contrato do aluguel.
          </p>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={loading} className="font-bold">
              Gerar cobrança
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
