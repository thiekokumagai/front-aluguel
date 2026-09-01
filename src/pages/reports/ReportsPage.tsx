import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { BarChart3, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const reportCards = [
    { id: 'rep-1', title: 'Recebimentos por Período', desc: 'Relatório detalhado de todas as entradas quitadas por mês.', icon: BarChart3 },
    { id: 'rep-2', title: 'Relatório de Inadimplência', desc: 'Análise de aluguéis em atraso, juros acumulados e devedores.', icon: FileText },
    { id: 'rep-3', title: 'Receita por Imóvel', desc: 'Rendimento individual por propriedade cadastrada.', icon: BarChart3 },
    { id: 'rep-4', title: 'Receita por Inquilino', desc: 'Consolidado financeiro agrupado por locatário.', icon: FileSpreadsheet },
    { id: 'rep-5', title: 'Contratos Vencendo', desc: 'Listagem de contratos a renovar nos próximos 90 dias.', icon: FileText },
    { id: 'rep-6', title: 'Histórico de Cobranças', desc: 'Registro completo de cobranças enviadas por WhatsApp e PIX.', icon: FileSpreadsheet },
  ];

  const handleGenerate = (reportTitle: string) => {
    setSelectedReport(reportTitle);
    setPreviewModalOpen(true);
  };

  const handleExportPDF = () => {
    toast.info('Exportando relatório para PDF (Simulação)...');
    setTimeout(() => {
      toast.success('Download do relatório em PDF concluído!');
    }, 1200);
  };

  const handleExportExcel = () => {
    toast.info('Exportando planilha para Excel (.xlsx)...');
    setTimeout(() => {
      toast.success('Download do arquivo Excel concluído!');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios & Análises"
        description="Gere relatórios gerenciais e exporte dados da sua carteira."
      />

      {/* Global Filters */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Filtros Globais de Relatório</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            label="Data Inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Data Final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            label="Imóvel"
            options={[
              { label: 'Todos os imóveis', value: 'ALL' },
              { label: 'Casa Jardim dos Estados', value: 'prop-1' },
              { label: 'Apto 102 Oscar Freire', value: 'prop-2' },
            ]}
          />
          <Select
            label="Status"
            options={[
              { label: 'Todos os status', value: 'ALL' },
              { label: 'Pagos', value: 'PAID' },
              { label: 'Atrasados', value: 'OVERDUE' },
            ]}
          />
        </div>
      </Card>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((rep) => {
          const Icon = rep.icon;
          return (
            <Card key={rep.id} className="flex flex-col justify-between hover:border-blue-400 transition-all">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 w-fit">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{rep.title}</h3>
                <p className="text-xs text-slate-500">{rep.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  onClick={() => handleGenerate(rep.title)}
                >
                  Gerar Relatório
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={selectedReport || 'Relatório Gerencial'}
        maxWidth="xl"
      >
        <div className="space-y-4 text-sm">
          <p className="text-xs text-slate-500">
            Período selecionado: {formatDate(startDate)} até {formatDate(endDate)}
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between font-bold border-b pb-2">
              <span>Item / Descrição</span>
              <span>Total Acumulado</span>
            </div>
            <div className="flex justify-between">
              <span>Aluguéis Quitados (PIX/Boleto)</span>
              <span className="font-bold text-emerald-600">R$ 14.200,00</span>
            </div>
            <div className="flex justify-between">
              <span>Multas e Juros por Atraso</span>
              <span className="font-bold text-rose-600">R$ 98,80</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-extrabold text-sm">
              <span>Total Líquido Gerado</span>
              <span>R$ 14.298,80</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportPDF}
            >
              Exportar PDF
            </Button>
            <Button
              variant="success"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportExcel}
            >
              Exportar Excel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
