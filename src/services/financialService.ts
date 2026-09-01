import type { FinancialTransaction } from '../types';
import { mockStorage } from '../mocks/storage';
import { delay } from './api';

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
      { month: 'Jun/26', receita: 16200 },
      { month: 'Jul/26', receita: 17000 },
      { month: 'Ago/26', receita: 14200 },
      { month: 'Set/26', receita: 18500 },
    ];
  },
};
