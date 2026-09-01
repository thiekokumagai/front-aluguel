import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chargeService } from '../../services/chargeService';
import type { Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ChargeStatusBadge } from '../../components/common/ChargeStatusBadge';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  QrCode,
  Copy,
  MessageCircle,
  CheckCircle2,
  User,
  Home,
  ArrowLeft,
  RefreshCw,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

export const ChargeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [charge, setCharge] = useState<Charge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCharge = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await chargeService.getById(id);
      if (!data) {
        toast.error('Cobrança não encontrada');
        navigate('/cobrancas');
        return;
      }
      setCharge(data);
    } catch (err) {
      toast.error('Erro ao carregar cobrança');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharge();
  }, [id]);

  const handleCopyPix = () => {
    if (!charge?.pixCode) return;
    navigator.clipboard.writeText(charge.pixCode);
    toast.success('Código PIX Copia e Cola copiado com sucesso!');
  };

  const handleSendWhatsApp = async () => {
    if (!charge) return;
    try {
      const res = await chargeService.sendWhatsAppReminder(charge.id);
      toast.success(res.message);
      loadCharge();
    } catch (err) {
      toast.error('Erro ao enviar cobrança por WhatsApp');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!charge) return;
    try {
      await chargeService.markAsPaid(charge.id, 'PIX');
      toast.success(`Cobrança de ${charge.tenantName} marcada como PAGA!`);
      loadCharge();
    } catch (err) {
      toast.error('Erro ao confirmar pagamento');
    }
  };

  if (isLoading || !charge) {
    return <div className="p-8 text-center text-slate-500">Carregando cobrança PIX...</div>;
  }

  const isDueToday = charge.dueDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        onClick={() => navigate('/cobrancas')}
      >
        Voltar para cobranças
      </Button>

      <PageHeader
        title={`Cobrança ${charge.code}`}
        description={`Competência ${charge.competence} • ${charge.tenantName}`}
        action={
          <div className="flex items-center gap-2">
            <ChargeStatusBadge status={charge.status} isDueToday={isDueToday} className="text-sm px-3 py-1" />
            {charge.status !== 'PAID' && (
              <Button variant="success" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={handleMarkAsPaid}>
                Marcar como Pago
              </Button>
            )}
          </div>
        }
        breadcrumbs={[
          { label: 'Cobranças', href: '/cobrancas' },
          { label: charge.code },
        ]}
      />

      {/* Main KPI Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase">Valor Original</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(charge.originalValue)}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase">Multa / Juros</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            +{formatCurrency(charge.fineValue + charge.interestValue)}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase">Valor Atualizado (Total)</p>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(charge.updatedValue)}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase">Data de Vencimento</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatDate(charge.dueDate)}
          </p>
          {charge.daysOverdue > 0 && charge.status !== 'PAID' && (
            <p className="text-xs text-rose-600 font-semibold mt-1">
              {charge.daysOverdue} dias de atraso
            </p>
          )}
        </Card>
      </div>

      {/* Grid: PIX QR Code & Info Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" /> Pagamento via PIX (QR Code & Copia e Cola)
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              Pagamento Instantâneo
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
            <div className="p-3 bg-white rounded-xl shadow-md shrink-0 border border-slate-200">
              <img
                src={charge.pixQrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_DEMO'}
                alt="QR Code PIX"
                className="w-36 h-36 object-contain"
              />
            </div>

            <div className="flex-1 space-y-3 w-full">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Código PIX Copia e Cola:
              </p>
              <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono break-all max-h-24 overflow-y-auto select-all border border-slate-700">
                {charge.pixCode}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Copy className="w-4 h-4" />}
                  onClick={handleCopyPix}
                >
                  Copiar PIX
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                  onClick={handleSendWhatsApp}
                >
                  Enviar pelo WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => toast.info('Nova cobrança PIX atualizada com sucesso.')}
                >
                  Gerar nova cobrança
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" /> Histórico da Cobrança
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {charge.history.map((hItem) => (
                <div key={hItem.id} className="relative flex items-start space-x-3">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{hItem.title}</p>
                      <span className="text-[10px] text-slate-400">{hItem.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hItem.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <User className="w-4 h-4 text-blue-600" /> Inquilino
            </h4>
            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <p><strong className="text-slate-900 dark:text-slate-100">{charge.tenantName}</strong></p>
              <p>Telefone: {charge.tenantPhone}</p>
              <p>WhatsApp: {charge.tenantPhone}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => navigate(`/inquilinos/${charge.tenantId}`)}
            >
              Ver Perfil Inquilino
            </Button>
          </Card>

          <Card className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Home className="w-4 h-4 text-blue-600" /> Imóvel
            </h4>
            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <p><strong className="text-slate-900 dark:text-slate-100">{charge.propertyName}</strong></p>
              <p>Contrato ID: {charge.contractId}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => navigate(`/imoveis/${charge.propertyId}`)}
            >
              Ver Imóvel
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
