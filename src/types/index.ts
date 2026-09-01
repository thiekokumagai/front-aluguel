export type ChargeStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';
export type ContractStatus = 'ACTIVE' | 'ENDING' | 'ENDED' | 'CANCELED';
export type PropertyStatus = 'RENTED' | 'AVAILABLE' | 'INACTIVE';
export type PropertyType = 'Casa' | 'Apartamento' | 'Sala comercial' | 'Terreno' | 'Outro';
export type ReadjustmentType = 'IPCA' | 'IGP-M' | 'Manual' | 'Sem reajuste';
export type TransactionType = 'Aluguel' | 'Multa' | 'Juros' | 'Outros';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'OWNER' | 'ADMIN';
  phone?: string;
  companyName?: string;
  document?: string; // CPF or CNPJ
}

export interface Property {
  id: string;
  code: string; // e.g. "IMO-001"
  name: string;
  type: PropertyType;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  defaultRentValue: number;
  status: PropertyStatus;
  currentTenantId?: string;
  currentTenantName?: string;
  notes?: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  phone: string;
  whatsapp: string;
  email: string;
  birthDate?: string;
  status: 'Ativo' | 'Sem contrato' | 'Inativo';
  currentPropertyId?: string;
  currentPropertyName?: string;
  currentContractId?: string;
  notes?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  code: string; // e.g. "CTR-2026-01"
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentValue: number;
  dueDay: number; // e.g. 5, 10, 15
  readjustmentType: ReadjustmentType;
  nextReadjustmentDate?: string;
  finePercent: number; // e.g. 2, 10
  interestPercentMonth: number; // e.g. 1
  toleranceDays: number;
  securityDeposit: number;
  status: ContractStatus;
  autoGenerateCharges: boolean;
  daysBeforeDueToGenerate: number; // e.g. 5
  autoSendWhatsApp: boolean;
  notes?: string;
  createdAt: string;
}

export interface ChargeHistoryItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  iconType?: 'creation' | 'pix' | 'reminder' | 'overdue' | 'payment' | 'system';
}

export interface Charge {
  id: string;
  code: string; // e.g. "COB-1092"
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  propertyId: string;
  propertyName: string;
  contractId: string;
  competence: string; // e.g. "09/2026"
  originalValue: number;
  fineValue: number;
  interestValue: number;
  updatedValue: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string; // YYYY-MM-DD
  daysOverdue: number;
  status: ChargeStatus;
  paymentMethod?: 'PIX' | 'Boleto' | 'Transferência' | 'Dinheiro';
  pixCode?: string;
  pixQrCodeUrl?: string;
  description?: string;
  history: ChargeHistoryItem[];
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  tenantName: string;
  propertyName: string;
  type: TransactionType;
  value: number;
  status: 'PAGO' | 'PENDENTE' | 'CANCELADO';
  chargeId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'payment' | 'due' | 'overdue' | 'contract';
  linkUrl?: string;
}

export interface DashboardMetrics {
  expectedRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  totalProperties: number;
  activeContracts: number;
  paidCount: number;
  dueCount: number;
  dueTodayCount: number;
  overdueCount: number;
}

export interface Settings {
  profile: {
    name: string;
    email: string;
    phone: string;
  };
  company: {
    name: string;
    document: string;
    phone: string;
    address: string;
  };
  charges: {
    defaultGenerateDaysBefore: number;
    defaultFinePercent: number;
    defaultInterestPercent: number;
  };
  reminders: {
    sendBeforeDue: boolean;
    daysBeforeDue: number;
    sendOnDueDate: boolean;
    sendAfterDue: boolean;
    repeatEveryDays: number;
  };
  whatsApp: {
    connected: boolean;
    instanceName: string;
    connectedNumber: string;
    lastSync: string;
  };
  cacto: {
    connected: boolean;
    apiKey: string;
    webhookSecret: string;
    webhookUrl: string;
  };
}
