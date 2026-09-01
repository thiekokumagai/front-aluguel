import type { Charge, ChargeStatus } from '../types';
import { mockStorage } from '../mocks/storage';
import { delay } from './api';
import { calculateUpdatedCharge } from '../utils/calculations';

export const chargeService = {
  async getAll(): Promise<Charge[]> {
    await delay();
    const charges = mockStorage.getCharges();
    return charges.map((chg) => {
      if (chg.status === 'OVERDUE' || (chg.status === 'PENDING' && new Date(chg.dueDate) < new Date())) {
        const calc = calculateUpdatedCharge(chg.originalValue, chg.dueDate, 2, 1);
        if (calc.daysOverdue > 0) {
          return {
            ...chg,
            status: 'OVERDUE' as ChargeStatus,
            daysOverdue: calc.daysOverdue,
            fineValue: calc.fineValue,
            interestValue: calc.interestValue,
            updatedValue: calc.updatedValue,
          };
        }
      }
      return chg;
    });
  },

  async getById(id: string): Promise<Charge | null> {
    await delay();
    const list = await this.getAll();
    return list.find((c) => c.id === id) || null;
  },

  async create(data: {
    tenantId: string;
    propertyId: string;
    contractId: string;
    competence: string;
    originalValue: number;
    dueDate: string;
    finePercent?: number;
    interestPercent?: number;
    description?: string;
    sendAfterCreate?: boolean;
  }): Promise<Charge> {
    await delay();
    const tenants = mockStorage.getTenants();
    const properties = mockStorage.getProperties();
    const tenant = tenants.find((t) => t.id === data.tenantId);
    const property = properties.find((p) => p.id === data.propertyId);

    const list = mockStorage.getCharges();
    const newCode = `COB-${1090 + list.length + 1}`;
    const timestampStr = new Date().toISOString();

    const pixRandom = Math.random().toString(36).substring(2, 10);
    const pixCode = `00020126580014br.gov.bcb.pix0136${pixRandom}-e89b-12d3-a456-4266141740005204000053039865407${data.originalValue.toFixed(2)}5802BR5925Eduardo Martins6009Sao Paulo6304`;

    const newCharge: Charge = {
      id: `chg-${Date.now()}`,
      code: newCode,
      tenantId: data.tenantId,
      tenantName: tenant?.name || 'Inquilino',
      tenantPhone: tenant?.phone || '(11) 99999-9999',
      propertyId: data.propertyId,
      propertyName: property?.name || 'Imóvel',
      contractId: data.contractId,
      competence: data.competence,
      originalValue: data.originalValue,
      fineValue: 0,
      interestValue: 0,
      updatedValue: data.originalValue,
      dueDate: data.dueDate,
      daysOverdue: 0,
      status: 'PENDING',
      pixCode,
      pixQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`,
      description: data.description || `Aluguel referente ao mês de ${data.competence}`,
      history: [
        {
          id: `h-${Date.now()}-1`,
          timestamp: new Date().toLocaleString('pt-BR'),
          title: 'Cobrança Criada',
          description: 'Cobrança manual gerada via sistema',
          iconType: 'creation',
        },
        {
          id: `h-${Date.now()}-2`,
          timestamp: new Date().toLocaleString('pt-BR'),
          title: 'PIX Gerado',
          description: 'Código PIX e QR Code gerados',
          iconType: 'pix',
        },
        ...(data.sendAfterCreate
          ? [
              {
                id: `h-${Date.now()}-3`,
                timestamp: new Date().toLocaleString('pt-BR'),
                title: 'Cobrança Enviada via WhatsApp',
                description: `Notificação enviada para ${tenant?.name || 'Inquilino'}`,
                iconType: 'reminder' as const,
              },
            ]
          : []),
      ],
      createdAt: timestampStr,
    };

    list.unshift(newCharge);
    mockStorage.saveCharges(list);
    return newCharge;
  },

  async markAsPaid(id: string, paymentMethod: 'PIX' | 'Boleto' | 'Transferência' | 'Dinheiro' = 'PIX'): Promise<Charge> {
    await delay();
    const list = mockStorage.getCharges();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Cobrança não encontrada');

    const charge = list[index];
    const today = new Date().toISOString().split('T')[0];

    const updated: Charge = {
      ...charge,
      status: 'PAID',
      paymentDate: today,
      paymentMethod,
      history: [
        ...charge.history,
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toLocaleString('pt-BR'),
          title: 'Pagamento Confirmado',
          description: `Pagamento de R$ ${charge.updatedValue.toFixed(2)} recebido via ${paymentMethod}`,
          iconType: 'payment',
        },
      ],
    };

    list[index] = updated;
    mockStorage.saveCharges(list);

    const financial = mockStorage.getFinancial();
    financial.unshift({
      id: `ft-${Date.now()}`,
      date: today,
      description: `Recebimento de Aluguel - ${charge.competence}`,
      tenantName: charge.tenantName,
      propertyName: charge.propertyName,
      type: 'Aluguel',
      value: charge.updatedValue,
      status: 'PAGO',
      chargeId: charge.id,
    });
    mockStorage.saveFinancial(financial);

    return updated;
  },

  async sendWhatsAppReminder(id: string): Promise<{ success: boolean; message: string }> {
    await delay(300);
    const list = mockStorage.getCharges();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Cobrança não encontrada');

    const charge = list[index];
    const newHistory = [
      ...charge.history,
      {
        id: `h-${Date.now()}`,
        timestamp: new Date().toLocaleString('pt-BR'),
        title: 'Lembrete enviado via WhatsApp',
        description: `Mensagem de cobrança enviada para ${charge.tenantName} (${charge.tenantPhone})`,
        iconType: 'reminder' as const,
      },
    ];

    list[index] = { ...charge, history: newHistory };
    mockStorage.saveCharges(list);

    return {
      success: true,
      message: `Cobrança enviada com sucesso via WhatsApp para ${charge.tenantName}!`,
    };
  },

  async cancel(id: string): Promise<Charge> {
    await delay();
    const list = mockStorage.getCharges();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Cobrança não encontrada');

    const updated: Charge = {
      ...list[index],
      status: 'CANCELED',
      history: [
        ...list[index].history,
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toLocaleString('pt-BR'),
          title: 'Cobrança Cancelada',
          description: 'Cobrança cancelada pelo proprietário',
          iconType: 'system',
        },
      ],
    };

    list[index] = updated;
    mockStorage.saveCharges(list);
    return updated;
  },
};
