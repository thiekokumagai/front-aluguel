import type { Contract } from '../types';
import { mockStorage } from '../mocks/storage';
import { delay } from './api';

export const contractService = {
  async getAll(): Promise<Contract[]> {
    await delay();
    return mockStorage.getContracts();
  },

  async getById(id: string): Promise<Contract | null> {
    await delay();
    const list = mockStorage.getContracts();
    return list.find((c) => c.id === id) || null;
  },

  async create(data: Omit<Contract, 'id' | 'code' | 'createdAt' | 'status'> & { status?: Contract['status'] }): Promise<Contract> {
    await delay();
    const list = mockStorage.getContracts();
    const newCodeYear = new Date().getFullYear();
    const newContract: Contract = {
      ...data,
      id: `ctr-${Date.now()}`,
      code: `CTR-${newCodeYear}-${String(list.length + 1).padStart(2, '0')}`,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newContract);
    mockStorage.saveContracts(list);

    const props = mockStorage.getProperties();
    const propIndex = props.findIndex((p) => p.id === data.propertyId);
    if (propIndex !== -1) {
      props[propIndex].status = 'RENTED';
      props[propIndex].currentTenantId = data.tenantId;
      props[propIndex].currentTenantName = data.tenantName;
      mockStorage.saveProperties(props);
    }

    const tenants = mockStorage.getTenants();
    const tenantIndex = tenants.findIndex((t) => t.id === data.tenantId);
    if (tenantIndex !== -1) {
      tenants[tenantIndex].status = 'Ativo';
      tenants[tenantIndex].currentPropertyId = data.propertyId;
      tenants[tenantIndex].currentPropertyName = data.propertyName;
      tenants[tenantIndex].currentContractId = newContract.id;
      mockStorage.saveTenants(tenants);
    }

    return newContract;
  },

  async update(id: string, data: Partial<Contract>): Promise<Contract> {
    await delay();
    const list = mockStorage.getContracts();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Contrato não encontrado');
    const updated = { ...list[index], ...data };
    list[index] = updated;
    mockStorage.saveContracts(list);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay();
    const list = mockStorage.getContracts().filter((c) => c.id !== id);
    mockStorage.saveContracts(list);
  },
};
