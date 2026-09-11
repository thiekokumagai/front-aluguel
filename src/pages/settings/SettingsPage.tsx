import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import type { Settings } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { PageContainer } from '../../components/layout/PageContainer';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isWspModalOpen, setIsWspModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      await settingsService.updateSettings(settings);
      toast.success('Configurações salvas com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar configurações');
    }
  };

  if (isLoading || !settings) {
    return (
      <PageContainer>
        <div className="p-8 text-center text-slate-500">Carregando configurações...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Ajuste dados do perfil, regras de cobrança, lembretes e integrações.
          </p>
        </div>

        <Card>
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'profile', label: 'Perfil' },
              { id: 'company', label: 'Empresa / Proprietário' },
              { id: 'charges', label: 'Regras de Cobrança' },
              { id: 'reminders', label: 'Lembretes WhatsApp' },
              { id: 'whatsapp', label: 'Integração WhatsApp' },
              { id: 'cacto', label: 'Gateway Cacto' },
            ]}
          />

          <div className="pt-6">
            {/* TAB 1: PERFIL */}
            {activeTab === 'profile' && (
              <div className="max-w-xl space-y-4">
                <Input
                  label="Nome do Proprietário"
                  value={settings.profile.name}
                  onChange={(e) =>
                    setSettings({ ...settings, profile: { ...settings.profile, name: e.target.value } })
                  }
                />
                <Input
                  label="E-mail de Acesso"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) =>
                    setSettings({ ...settings, profile: { ...settings.profile, email: e.target.value } })
                  }
                />
                <Input
                  label="Telefone Principal"
                  value={settings.profile.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, profile: { ...settings.profile, phone: e.target.value } })
                  }
                />
                <Button variant="primary" onClick={handleSave} className="mt-4">
                  Salvar Perfil
                </Button>
              </div>
            )}

            {/* TAB 2: EMPRESA */}
            {activeTab === 'company' && (
              <div className="max-w-xl space-y-4">
                <Input
                  label="Razão Social / Nome da Empresa"
                  value={settings.company.name}
                  onChange={(e) =>
                    setSettings({ ...settings, company: { ...settings.company, name: e.target.value } })
                  }
                />
                <Input
                  label="CPF ou CNPJ"
                  value={settings.company.document}
                  onChange={(e) =>
                    setSettings({ ...settings, company: { ...settings.company, document: e.target.value } })
                  }
                />
                <Input
                  label="Telefone Comercial"
                  value={settings.company.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, company: { ...settings.company, phone: e.target.value } })
                  }
                />
                <Input
                  label="Endereço Comercial Completo"
                  value={settings.company.address}
                  onChange={(e) =>
                    setSettings({ ...settings, company: { ...settings.company, address: e.target.value } })
                  }
                />
                <Button variant="primary" onClick={handleSave} className="mt-4">
                  Salvar Dados da Empresa
                </Button>
              </div>
            )}

            {/* TAB 3: COBRANÇAS */}
            {activeTab === 'charges' && (
              <div className="max-w-xl space-y-4">
                <Select
                  label="Gerar cobranças automaticamente quanto tempo antes?"
                  value={settings.charges.defaultGenerateDaysBefore}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      charges: {
                        ...settings.charges,
                        defaultGenerateDaysBefore: Number(e.target.value),
                      },
                    })
                  }
                  options={[
                    { label: '3 dias antes', value: 3 },
                    { label: '5 dias antes', value: 5 },
                    { label: '10 dias antes', value: 10 },
                    { label: 'No dia do vencimento', value: 0 },
                  ]}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Multa padrão (%)"
                    type="number"
                    value={settings.charges.defaultFinePercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        charges: { ...settings.charges, defaultFinePercent: Number(e.target.value) },
                      })
                    }
                  />
                  <Input
                    label="Juros padrão (%/mês)"
                    type="number"
                    value={settings.charges.defaultInterestPercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        charges: { ...settings.charges, defaultInterestPercent: Number(e.target.value) },
                      })
                    }
                  />
                </div>

                <Button variant="primary" onClick={handleSave} className="mt-4">
                  Salvar Regras
                </Button>
              </div>
            )}

            {/* TAB 4: LEMBRETES */}
            {activeTab === 'reminders' && (
              <div className="max-w-xl space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remBefore"
                      checked={settings.reminders.sendBeforeDue}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          reminders: { ...settings.reminders, sendBeforeDue: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="remBefore" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Enviar lembrete antes do vencimento
                    </label>
                  </div>
                  {settings.reminders.sendBeforeDue && (
                    <Input
                      label="Quantos dias antes do vencimento?"
                      type="number"
                      value={settings.reminders.daysBeforeDue}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          reminders: { ...settings.reminders, daysBeforeDue: Number(e.target.value) },
                        })
                      }
                    />
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remOnDay"
                      checked={settings.reminders.sendOnDueDate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          reminders: { ...settings.reminders, sendOnDueDate: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="remOnDay" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Enviar lembrete no dia do vencimento
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remAfter"
                      checked={settings.reminders.sendAfterDue}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          reminders: { ...settings.reminders, sendAfterDue: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="remAfter" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Enviar lembrete em cobranças atrasadas
                    </label>
                  </div>
                  {settings.reminders.sendAfterDue && (
                    <Input
                      label="Repetir lembrete a cada X dias"
                      type="number"
                      value={settings.reminders.repeatEveryDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          reminders: { ...settings.reminders, repeatEveryDays: Number(e.target.value) },
                        })
                      }
                    />
                  )}
                </div>

                <Button variant="primary" onClick={handleSave} className="mt-4">
                  Salvar Régua de Comunicação
                </Button>
              </div>
            )}

            {/* TAB 5: WHATSAPP */}
            {activeTab === 'whatsapp' && (
              <div className="max-w-xl space-y-6">
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        WhatsApp Conectado (Instância Mock)
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        {settings.whatsApp.instanceName} • {settings.whatsApp.connectedNumber}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsWspModalOpen(true)}
                  >
                    Reconectar QR Code
                  </Button>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p><strong>Última sincronização:</strong> {settings.whatsApp.lastSync}</p>
                  <p>Envios automáticos de mensagens ativos para 10 locatários.</p>
                </div>
              </div>
            )}

            {/* TAB 6: CACTO */}
            {activeTab === 'cacto' && (
              <div className="max-w-xl space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Aviso de Arquitetura Backend:</strong>
                    <p className="mt-1">
                      A integração real com a API da Cacto (gateway PIX) será realizada posteriormente através do backend NestJS.
                    </p>
                  </div>
                </div>

                <Input label="Cacto Live API Key" value={settings.cacto.apiKey} readOnly />
                <Input label="Webhook Secret Key" value={settings.cacto.webhookSecret} readOnly />
                <Input label="URL de Notificação (Webhook)" value={settings.cacto.webhookUrl} readOnly />

                <Button
                  variant="primary"
                  onClick={() => toast.success('Configurações do Gateway salvas.')}
                >
                  Salvar Credenciais Cacto
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* WhatsApp QR Modal */}
        <Modal
          isOpen={isWspModalOpen}
          onClose={() => setIsWspModalOpen(false)}
          title="Conectar Instância do WhatsApp"
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center p-4 space-y-4">
            <p className="text-xs text-slate-500">
              Abra o WhatsApp no seu celular &gt; Aparelhos conectados &gt; Conectar aparelho e escaneie o código abaixo:
            </p>
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WHATSAPP_SIMULATION"
                alt="QR Code WhatsApp"
                className="w-44 h-44 object-contain"
              />
            </div>
            <Button
              variant="success"
              className="w-full"
              onClick={() => {
                setIsWspModalOpen(false);
                toast.success('WhatsApp reconectado com sucesso!');
              }}
            >
              Simular Leitura do QR Code
            </Button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
};
