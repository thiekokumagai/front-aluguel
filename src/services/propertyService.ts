import type { Property } from '../types';
import { mockStorage } from '../mocks/storage';
import { delay } from './api';

export const propertyService = {
  async getAll(): Promise<Property[]> {
    await delay();
    return mockStorage.getProperties();
  },

  async getById(id: string): Promise<Property | null> {
    await delay();
    const list = mockStorage.getProperties();
    return list.find((p) => p.id === id) || null;
  },

  async create(data: Omit<Property, 'id' | 'code' | 'createdAt' | 'status'> & { status?: Property['status'] }): Promise<Property> {
    await delay();
    const list = mockStorage.getProperties();
    const newCodeNumber = list.length + 1;
    const newProperty: Property = {
      ...data,
      id: `prop-${Date.now()}`,
      code: `IMO-${String(newCodeNumber).padStart(3, '0')}`,
      status: data.status || 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newProperty);
    mockStorage.saveProperties(list);
    return newProperty;
  },

  async update(id: string, data: Partial<Property>): Promise<Property> {
    await delay();
    const list = mockStorage.getProperties();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Imóvel não encontrado');
    const updated = { ...list[index], ...data };
    list[index] = updated;
    mockStorage.saveProperties(list);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay();
    const list = mockStorage.getProperties().filter((p) => p.id !== id);
    mockStorage.saveProperties(list);
  },
};
