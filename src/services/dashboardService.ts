import type { DashboardMetrics } from '../types';
import { chargeService } from './chargeService';
import { propertyService } from './propertyService';
import { contractService } from './contractService';
import { delay } from './api';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    await delay();
    const charges = await chargeService.getAll();
    const properties = await propertyService.getAll();
    const contracts = await contractService.getAll();

    let expectedRevenue = 0;
    let receivedRevenue = 0;
    let pendingRevenue = 0;
    let overdueRevenue = 0;

    let paidCount = 0;
    let dueCount = 0;
    let dueTodayCount = 0;
    let overdueCount = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    charges.forEach((c) => {
      // Consider September 2026 as current month for demo data
      const isCurrentMonth = c.competence === '09/2026' || c.dueDate.startsWith('2026-09') || c.paymentDate?.startsWith('2026-09');

      if (c.status === 'PAID' && isCurrentMonth) {
        receivedRevenue += c.updatedValue;
        paidCount++;
      } else if (c.status === 'PENDING') {
        expectedRevenue += c.originalValue;
        pendingRevenue += c.originalValue;
        if (c.dueDate === todayStr) {
          dueTodayCount++;
        } else {
          dueCount++;
        }
      } else if (c.status === 'OVERDUE') {
        expectedRevenue += c.updatedValue;
        overdueRevenue += c.updatedValue;
        overdueCount++;
      }
    });

    expectedRevenue = receivedRevenue + pendingRevenue + overdueRevenue;
    const activeContracts = contracts.filter((c) => c.status === 'ACTIVE' || c.status === 'ENDING').length;

    return {
      expectedRevenue,
      receivedRevenue,
      pendingRevenue,
      overdueRevenue,
      totalProperties: properties.length,
      activeContracts,
      paidCount,
      dueCount,
      dueTodayCount,
      overdueCount,
    };
  },

  async getRevenueChartData() {
    await delay();
    const charges = await chargeService.getAll();

    // Group charges by competence month
    const monthsMap: Record<string, { month: string; recebido: number; pendente: number }> = {
      '04/2026': { month: 'Abril', recebido: 13800, pendente: 0 },
      '05/2026': { month: 'Maio', recebido: 15200, pendente: 0 },
      '06/2026': { month: 'Junho', recebido: 16000, pendente: 0 },
      '07/2026': { month: 'Julho', recebido: 17100, pendente: 0 },
      '08/2026': { month: 'Agosto', recebido: 14200, pendente: 2252.8 },
      '09/2026': { month: 'Setembro', recebido: 0, pendente: 0 },
    };

    charges.forEach((c) => {
      const comp = c.competence;
      if (monthsMap[comp]) {
        if (c.status === 'PAID') {
          monthsMap[comp].recebido += c.updatedValue;
        } else if (c.status === 'PENDING' || c.status === 'OVERDUE') {
          monthsMap[comp].pendente += c.updatedValue;
        }
      }
    });

    return Object.values(monthsMap);
  },
};
