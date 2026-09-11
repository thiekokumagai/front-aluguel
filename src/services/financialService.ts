import type { FinancialTransaction } from '../types';
import { mockStorage } from '../mocks/storage';
import { chargeService } from './chargeService';
import { delay } from './api';

export interface MonthSummaryDetail {
  monthKey: string; // e.g. "09/2026"
  label: string; // e.g. "Setembro 2026"
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  paidCount: number;
  payments: Array<{
    tenantName: string;
    propertyName: string;
    value: number;
    date: string;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
    daysOverdue?: number;
  }>;
}

export const financialService = {
  async getAll(): Promise<FinancialTransaction[]> {
    await delay();
    return mockStorage.getFinancial();
  },

  async addTransaction(tx: Omit<FinancialTransaction, 'id'>): Promise<FinancialTransaction> {
    await delay();
    const list = mockStorage.getFinancial();
    const newTx: FinancialTransaction = {
      ...tx,
      id: `ft-${Date.now()}`,
    };
    list.unshift(newTx);
    mockStorage.saveFinancial(list);
    return newTx;
  },

  async getMonthlyRevenue12Months() {
    await delay();
    return [
      { month: 'Out/25', receita: 11200 },
      { month: 'Nov/25', receita: 11800 },
      { month: 'Dez/25', receita: 12500 },
      { month: 'Jan/26', receita: 13000 },
      { month: 'Fev/26', receita: 13500 },
      { month: 'Mar/26', receita: 14200 },
      { month: 'Abr/26', receita: 14800 },
      { month: 'Mai/26', receita: 15500 },
      { month: 'Jun/26', receita: 16000 },
      { month: 'Jul/26', receita: 17100 },
      { month: 'Ago/26', receita: 14200 },
      { month: 'Set/26', receita: 7500 },
    ];
  },

  async getMonthSummaries(): Promise<MonthSummaryDetail[]> {
    await delay();
    const charges = await chargeService.getAll();

    const monthsConfig = [
      { monthKey: '09/2026', label: 'Setembro 2026', basePaidCount: 0, baseReceived: 0, basePending: 0, baseOverdue: 0 },
      { monthKey: '08/2026', label: 'Agosto 2026', basePaidCount: 8, baseReceived: 14200, basePending: 0, baseOverdue: 5031.10 },
      { monthKey: '07/2026', label: 'Julho 2026', basePaidCount: 7, baseReceived: 13500, basePending: 0, baseOverdue: 0 },
      { monthKey: '06/2026', label: 'Junho 2026', basePaidCount: 9, baseReceived: 16000, basePending: 0, baseOverdue: 0 },
    ];

    return monthsConfig.map((mConfig) => {
      const monthCharges = charges.filter(
        (c) => c.competence === mConfig.monthKey || c.dueDate.startsWith(`2026-${mConfig.monthKey.split('/')[0]}`)
      );

      const paidCharges = monthCharges.filter((c) => c.status === 'PAID');
      const pendingCharges = monthCharges.filter((c) => c.status === 'PENDING');
      const overdueCharges = monthCharges.filter((c) => c.status === 'OVERDUE');

      const dynamicReceived = paidCharges.reduce((acc, c) => acc + c.updatedValue, 0);
      const dynamicPending = pendingCharges.reduce((acc, c) => acc + c.originalValue, 0);
      const dynamicOverdue = overdueCharges.reduce((acc, c) => acc + c.updatedValue, 0);

      const totalReceived = mConfig.baseReceived + dynamicReceived;
      const totalPending = mConfig.basePending + dynamicPending;
      const totalOverdue = mConfig.baseOverdue + dynamicOverdue;
      const paidCount = mConfig.basePaidCount + paidCharges.length;

      const payments: MonthSummaryDetail['payments'] = monthCharges.map((c) => ({
        tenantName: c.tenantName,
        propertyName: c.propertyName,
        value: c.updatedValue,
        date: c.paymentDate || c.dueDate,
        status: c.status as 'PAID' | 'PENDING' | 'OVERDUE',
        daysOverdue: c.daysOverdue,
      }));

      // Add default historical items if empty for demonstration
      if (payments.length === 0 && mConfig.monthKey !== '09/2026') {
        payments.push(
          { tenantName: 'Carlos Silva', propertyName: 'Casa Jardim dos Estados', value: 1800, date: `2026-${mConfig.monthKey.split('/')[0]}-05`, status: 'PAID' },
          { tenantName: 'Ana Oliveira', propertyName: 'Apto 102', value: 2500, date: `2026-${mConfig.monthKey.split('/')[0]}-10`, status: 'PAID' },
          { tenantName: 'Roberto Santos', propertyName: 'Sala Comercial', value: 3200, date: `2026-${mConfig.monthKey.split('/')[0]}-05`, status: 'PAID' }
        );
      }

      return {
        monthKey: mConfig.monthKey,
        label: mConfig.label,
        totalReceived,
        totalPending,
        totalOverdue,
        paidCount,
        payments,
      };
    });
  },
};
