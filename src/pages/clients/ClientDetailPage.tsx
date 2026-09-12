import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import { contractService } from '../../services/contractService';
import { chargeService } from '../../services/chargeService';
import type { Tenant, Contract, Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  ArrowLeft,
  MessageSquare,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Tenant | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [showFullDocument, setShowFullDocument] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editDocument, setEditDocument] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadClientDetail = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [t, allContracts, allCharges] = await Promise.all([
        tenantService.getById(id),
        contractService.getAll(),
        chargeService.getAll(),
      ]);

      if (!t) {
        toast.error('Cliente não encontrado.');
        navigate('/clientes');
        return;
      }

      setClient(t);
      const clientContracts = allContracts.filter((c) => c.tenantId === t.id);
      setContracts(clientContracts);
      setCharges(allCharges.filter((ch) => ch.tenantId === t.id));

      setEditName(t.name);
      setEditWhatsapp(t.whatsapp || t.phone);
      setEditDocument(t.document || '');
      setEditEmail(t.email || '');
      setEditNotes(t.notes || '');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar detalhes do cliente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientDetail();
  }, [id]);

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setIsSaving(true);
    try {
      await tenantService.update(client.id, {
        name: editName,
        whatsapp: editWhatsapp,
        phone: editWhatsapp,
        document: editDocument,
        email: editEmail,
        notes: editNotes,
      });
      toast.success('Dados do cliente atualizados!');
      setIsEditOpen(false);
      loadClientDetail();
    } catch (err) {
      toast.error('Erro ao atualizar cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  const openWhatsApp = () => {
    if (!client?.whatsapp) return;
    const cleanNumber = client.whatsapp.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    window.open(`https://wa.me/${fullNumber}`, '_blank');
  };

  if (isLoading || !client) {
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

  // Mask CPF
  const maskedDocument = client.document
    ? client.document.replace(/^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/, '$1.***.***-$2')
    : 'Não informado';

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/clientes')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para clientes</span>
        </button>

        {/* Cartão de Cabeçalho do Cliente */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {client.name}
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Cadastrado em {formatDate(client.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="md"
                variant="outline"
                fullWidthMobile
                leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
                onClick={openWhatsApp}
                className="font-bold text-xs border-emerald-300 text-emerald-700 dark:text-emerald-400"
              >
                WhatsApp
              </Button>
              <Button
                size="md"
                variant="outline"
                fullWidthMobile
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => setIsEditOpen(true)}
                className="font-semibold text-xs"
              >
                Editar
              </Button>
            </div>
          </div>

        {/* Dados de Contato e Documentos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400">Telefone / WhatsApp</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {client.whatsapp || client.phone}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400">E-mail</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
              {client.email || 'Não informado'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">CPF / CNPJ</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {showFullDocument ? client.document : maskedDocument}
              </p>
            </div>
            <button
              onClick={() => setShowFullDocument(!showFullDocument)}
              className="p-1 text-slate-400 hover:text-slate-600"
              title="Exibir/Ocultar documento"
            >
              {showFullDocument ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {client.notes && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-sm mt-4">
            <span className="text-xs font-semibold text-slate-400">Observações</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-1">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Seção Aluguel Atual */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Aluguel atual
        </h2>

        {contracts.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">Este cliente não possui nenhum aluguel ativo no momento.</p>
        ) : (
          <div className="space-y-3">
            {contracts.map((c) => {
              const latestCharge = charges.find((ch) => ch.contractId === c.id);
              const isOverdue = latestCharge?.status === 'OVERDUE';

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {c.propertyName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Vencimento todo dia {c.dueDay}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {formatCurrency(c.rentValue)}
                        <span className="text-xs font-normal text-slate-400">/mês</span>
                      </p>
                      <div className="mt-0.5">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> 🔴 Aluguel atrasado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 Em dia
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                      onClick={() => navigate(`/alugueis/${c.id}`)}
                      className="font-bold text-xs"
                    >
                      Ver aluguel
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Histórico de pagamentos
        </h2>

        {charges.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">Nenhum pagamento registrado no histórico.</p>
        ) : (
          <div className="space-y-3">
            {charges.map((chg) => (
              <div
                key={chg.id}
                className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {chg.competence} — {chg.propertyName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Vencimento: {formatDate(chg.dueDate)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                    {formatCurrency(chg.updatedValue)}
                  </p>
                  <div>
                    {chg.status === 'PAID' ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Pago em {formatDate(chg.paymentDate || chg.dueDate)}
                      </span>
                    ) : chg.status === 'OVERDUE' ? (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ Atrasado
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 🕐 A receber
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar Cliente */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Dados do Cliente"
        maxWidth="xl"
      >
        <form onSubmit={handleUpdateClient} className="space-y-4 p-2">
          <Input
            label="Nome completo *"
            placeholder="Ex: Carlos Silva"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="WhatsApp *"
              placeholder="(67) 99999-9999"
              value={editWhatsapp}
              onChange={(e) => setEditWhatsapp(e.target.value)}
            />
            <Input
              label="CPF / CNPJ"
              placeholder="000.000.000-00"
              value={editDocument}
              onChange={(e) => setEditDocument(e.target.value)}
            />
          </div>
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Input
              label="E-mail"
              type="email"
              placeholder="cliente@email.com"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observações
              </label>
              <textarea
                rows={2}
                placeholder="Anotações sobre a pessoa..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
              />
            </div>
          </div>

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
