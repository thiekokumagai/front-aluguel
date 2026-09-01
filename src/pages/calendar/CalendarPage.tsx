import React, { useState, useEffect } from 'react';
import { chargeService } from '../../services/chargeService';
import type { Charge } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CalendarPage: React.FC = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026

  const navigate = useNavigate();

  useEffect(() => {
    chargeService.getAll().then(setCharges);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getChargeColor = (c: Charge) => {
    if (c.status === 'PAID') return 'bg-emerald-500 text-white';
    if (c.status === 'OVERDUE') return 'bg-rose-500 text-white';
    if (c.dueDate === todayStr) return 'bg-amber-500 text-white';
    return 'bg-blue-600 text-white';
  };

  const getChargesForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return charges.filter((c) => c.dueDate === dayStr);
  };

  const todayCharges = charges.filter((c) => c.dueDate === todayStr);
  const overdueCharges = charges.filter((c) => c.status === 'OVERDUE');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário de Vencimentos"
        description="Acompanhe cronologicamente todos os vencimentos de aluguéis."
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'primary' : 'outline'}
              leftIcon={<CalendarIcon className="w-4 h-4" />}
              onClick={() => setViewMode('month')}
            >
              Mês
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              leftIcon={<List className="w-4 h-4" />}
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentDate(new Date(2026, 8, 1))}
                >
                  Hoje
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {viewMode === 'month' ? (
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="py-2 text-xs font-bold text-slate-400 uppercase">
                    {day}
                  </div>
                ))}

                {[...Array(firstDayIndex)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg" />
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const dayCharges = getChargesForDay(day);
                  const isToday =
                    day === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();

                  return (
                    <div
                      key={`day-${day}`}
                      className={`h-24 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-colors overflow-hidden ${
                        isToday
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 font-bold'
                          : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        {day}
                      </span>

                      <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none">
                        {dayCharges.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCharge(c)}
                            className={`w-full text-[10px] font-semibold px-1.5 py-0.5 rounded truncate text-left cursor-pointer transition-transform hover:scale-102 ${getChargeColor(
                              c
                            )}`}
                          >
                            {c.tenantName.split(' ')[0]} - {formatCurrency(c.updatedValue)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-4 py-3">Vencimento</th>
                      <th className="px-4 py-3">Inquilino</th>
                      <th className="px-4 py-3">Imóvel</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {charges.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCharge(c)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                      >
                        <td className="px-4 py-3 font-semibold">{formatDate(c.dueDate)}</td>
                        <td className="px-4 py-3">{c.tenantName}</td>
                        <td className="px-4 py-3">{c.propertyName}</td>
                        <td className="px-4 py-3 font-bold">{formatCurrency(c.updatedValue)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getChargeColor(c)}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Clock className="w-4 h-4 text-amber-500" /> Vencendo Hoje
            </h4>
            {todayCharges.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum vencimento hoje.</p>
            ) : (
              todayCharges.map((c) => (
                <div key={c.id} className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-xs space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-200">{c.tenantName}</p>
                  <p className="text-slate-600 dark:text-slate-300">{c.propertyName}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(c.originalValue)}</p>
                </div>
              ))
            )}
          </Card>

          <Card className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Atrasados
            </h4>
            {overdueCharges.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum aluguel atrasado.</p>
            ) : (
              overdueCharges.map((c) => (
                <div key={c.id} className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs space-y-1">
                  <p className="font-bold text-rose-900 dark:text-rose-200">{c.tenantName}</p>
                  <p className="text-slate-600 dark:text-slate-300">{c.daysOverdue} dias atraso</p>
                  <p className="font-bold text-rose-700 dark:text-rose-400">{formatCurrency(c.updatedValue)}</p>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      {selectedCharge && (
        <Modal
          isOpen={!!selectedCharge}
          onClose={() => setSelectedCharge(null)}
          title={`Cobrança ${selectedCharge.code}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <p><strong className="text-slate-500">Inquilino:</strong> {selectedCharge.tenantName}</p>
              <p><strong className="text-slate-500">Imóvel:</strong> {selectedCharge.propertyName}</p>
              <p><strong className="text-slate-500">Vencimento:</strong> {formatDate(selectedCharge.dueDate)}</p>
              <p><strong className="text-slate-500">Valor Atualizado:</strong> <span className="font-bold text-blue-600">{formatCurrency(selectedCharge.updatedValue)}</span></p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setSelectedCharge(null)}>
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const cId = selectedCharge.id;
                  setSelectedCharge(null);
                  navigate(`/cobrancas/${cId}`);
                }}
              >
                Abrir Cobrança PIX
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
