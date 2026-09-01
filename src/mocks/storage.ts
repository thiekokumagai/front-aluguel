import {
  initialProperties,
  initialTenants,
  initialContracts,
  initialCharges,
  initialFinancialTransactions,
  initialNotifications,
  initialSettings,
  mockUser,
} from './mockData';
import type { Property, Tenant, Contract, Charge, FinancialTransaction, AppNotification, Settings, User } from '../types';

const STORAGE_KEYS = {
  PROPERTIES: 'aluguel_saas_properties_v1',
  TENANTS: 'aluguel_saas_tenants_v1',
  CONTRACTS: 'aluguel_saas_contracts_v1',
  CHARGES: 'aluguel_saas_charges_v1',
  FINANCIAL: 'aluguel_saas_financial_v1',
  NOTIFICATIONS: 'aluguel_saas_notifications_v1',
  SETTINGS: 'aluguel_saas_settings_v1',
  USER: 'aluguel_saas_user_v1',
  AUTH: 'aluguel_saas_auth_token_v1',
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export function initMockStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    setStorageItem(STORAGE_KEYS.PROPERTIES, initialProperties);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    setStorageItem(STORAGE_KEYS.TENANTS, initialTenants);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTRACTS)) {
    setStorageItem(STORAGE_KEYS.CONTRACTS, initialContracts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHARGES)) {
    setStorageItem(STORAGE_KEYS.CHARGES, initialCharges);
  }
  if (!localStorage.getItem(STORAGE_KEYS.FINANCIAL)) {
    setStorageItem(STORAGE_KEYS.FINANCIAL, initialFinancialTransactions);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setStorageItem(STORAGE_KEYS.SETTINGS, initialSettings);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    setStorageItem(STORAGE_KEYS.USER, mockUser);
  }
}

export const mockStorage = {
  getProperties: (): Property[] => getStorageItem(STORAGE_KEYS.PROPERTIES, initialProperties),
  saveProperties: (data: Property[]) => setStorageItem(STORAGE_KEYS.PROPERTIES, data),

  getTenants: (): Tenant[] => getStorageItem(STORAGE_KEYS.TENANTS, initialTenants),
  saveTenants: (data: Tenant[]) => setStorageItem(STORAGE_KEYS.TENANTS, data),

  getContracts: (): Contract[] => getStorageItem(STORAGE_KEYS.CONTRACTS, initialContracts),
  saveContracts: (data: Contract[]) => setStorageItem(STORAGE_KEYS.CONTRACTS, data),

  getCharges: (): Charge[] => getStorageItem(STORAGE_KEYS.CHARGES, initialCharges),
  saveCharges: (data: Charge[]) => setStorageItem(STORAGE_KEYS.CHARGES, data),

  getFinancial: (): FinancialTransaction[] => getStorageItem(STORAGE_KEYS.FINANCIAL, initialFinancialTransactions),
  saveFinancial: (data: FinancialTransaction[]) => setStorageItem(STORAGE_KEYS.FINANCIAL, data),

  getNotifications: (): AppNotification[] => getStorageItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications),
  saveNotifications: (data: AppNotification[]) => setStorageItem(STORAGE_KEYS.NOTIFICATIONS, data),

  getSettings: (): Settings => getStorageItem(STORAGE_KEYS.SETTINGS, initialSettings),
  saveSettings: (data: Settings) => setStorageItem(STORAGE_KEYS.SETTINGS, data),

  getUser: (): User => getStorageItem(STORAGE_KEYS.USER, mockUser),
  saveUser: (data: User) => setStorageItem(STORAGE_KEYS.USER, data),

  getAuthToken: (): string | null => localStorage.getItem(STORAGE_KEYS.AUTH),
  setAuthToken: (token: string) => localStorage.setItem(STORAGE_KEYS.AUTH, token),
  removeAuthToken: () => localStorage.removeItem(STORAGE_KEYS.AUTH),

  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    localStorage.removeItem(STORAGE_KEYS.TENANTS);
    localStorage.removeItem(STORAGE_KEYS.CONTRACTS);
    localStorage.removeItem(STORAGE_KEYS.CHARGES);
    localStorage.removeItem(STORAGE_KEYS.FINANCIAL);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    initMockStorage();
  },
};
