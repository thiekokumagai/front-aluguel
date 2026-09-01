import type { Tenant } from '../types';
import { mockStorage } from '../mocks/storage';
import { delay } from './api';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    await delay();
    return mockStorage.getTenants();
  },

  async getById(id: string): Promise<Tenant | null> {
    await delay();
    const list = mockStorage.getTenants();
    return list.find((t) => t.id === id) || null;
  },

  async create(data: Omit<Tenant, 'id' | 'createdAt' | 'status'> & { status?: Tenant['status'] }): Promise<Tenant> {
    await delay();
    const list = mockStorage.getTenants();
    const newTenant: Tenant = {
      ...data,
      id: `ten-${Date.now()}`,
      status: data.status || 'Sem contrato',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newTenant);
    mockStorage.saveTenants(list);
    return newTenant;
  },

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    await delay();
    const list = mockStorage.getTenants();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Inquilino não encontrado');
    const updated = { ...list[index], ...data };
    list[index] = updated;
    mockStorage.saveTenants(list);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay();
    const list = mockStorage.getTenants().filter((t) => t.id !== id);
    mockStorage.saveTenants(list);
  },
};
