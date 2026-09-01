import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Search, Home, Users, FileText, CreditCard, ArrowRight } from 'lucide-react';
import { mockStorage } from '../../mocks/storage';
import type { Property, Tenant, Contract, Charge } from '../../types';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setProperties(mockStorage.getProperties());
      setTenants(mockStorage.getTenants());
      setContracts(mockStorage.getContracts());
      setCharges(mockStorage.getCharges());
      setQuery('');
    }
  }, [isOpen]);

  const q = query.toLowerCase().trim();

  const filteredProperties = q
    ? properties.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.address.city.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredTenants = q
    ? tenants.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.document.includes(q) ||
          t.email.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredContracts = q
    ? contracts.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.propertyName.toLowerCase().includes(q) ||
          c.tenantName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredCharges = q
    ? charges.filter(
        (chg) =>
          chg.code.toLowerCase().includes(q) ||
          chg.tenantName.toLowerCase().includes(q) ||
          chg.propertyName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por imóvel, inquilino, contrato ou cobrança..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="max-h-96 overflow-y-auto space-y-4 py-2">
          {!q && (
            <div className="text-center py-8 text-sm text-slate-500">
              Digite algo para pesquisar em toda a sua carteira de aluguéis.
            </div>
          )}

          {q &&
            filteredProperties.length === 0 &&
            filteredTenants.length === 0 &&
            filteredContracts.length === 0 &&
            filteredCharges.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-500">
                Nenhum resultado encontrado para "{query}".
              </div>
            )}

          {filteredProperties.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Imóveis
              </p>
              <div className="space-y-1">
                {filteredProperties.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(`/imoveis/${p.id}`)}
                    className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {p.name}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">({p.code})</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTenants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Inquilinos
              </p>
              <div className="space-y-1">
                {filteredTenants.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect(`/inquilinos/${t.id}`)}
                    className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {t.name}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">{t.document}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredContracts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Contratos
              </p>
              <div className="space-y-1">
                {filteredContracts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect('/contratos')}
                    className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {c.code} — {c.tenantName}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">({c.propertyName})</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCharges.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Cobranças
              </p>
              <div className="space-y-1">
                {filteredCharges.map((chg) => (
                  <div
                    key={chg.id}
                    onClick={() => handleSelect(`/cobrancas/${chg.id}`)}
                    className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {chg.code} — {chg.tenantName} ({chg.competence})
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
