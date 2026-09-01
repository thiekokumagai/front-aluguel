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
      if (c.status === 'PAID' && (c.competence === '09/2026' || c.paymentDate?.startsWith('2026-09') || c.paymentDate?.startsWith('2026-08'))) {
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
    return [
      { month: 'Março', recebido: 12500, pendente: 0 },
      { month: 'Abril', recebido: 13800, pendente: 0 },
      { month: 'Maio', recebido: 15200, pendente: 0 },
      { month: 'Junho', recebido: 16000, pendente: 0 },
      { month: 'Julho', recebido: 17100, pendente: 0 },
      { month: 'Agosto', recebido: 14200, pendente: 2252.80 },
      { month: 'Setembro', recebido: 3200, pendente: 10500 },
    ];
  },
};
