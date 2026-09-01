import { z } from 'zod';

export const contractSchema = z.object({
  propertyId: z.string().min(1, 'Selecione um imóvel'),
  tenantId: z.string().min(1, 'Selecione um inquilino'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  rentValue: z.number().min(1, 'Informe um valor válido'),
  dueDay: z.number().min(1).max(31, 'Dia de vencimento inválido'),
  readjustmentType: z.enum(['IPCA', 'IGP-M', 'Manual', 'Sem reajuste']),
  nextReadjustmentDate: z.string().optional(),
  finePercent: z.number().min(0, 'Multa inválida'),
  interestPercentMonth: z.number().min(0, 'Juros inválidos'),
  toleranceDays: z.number().min(0),
  securityDeposit: z.number().min(0),
  notes: z.string().optional(),
  autoGenerateCharges: z.boolean(),
  daysBeforeDueToGenerate: z.number().min(1).max(30),
  autoSendWhatsApp: z.boolean(),
});

export type ContractFormData = z.infer<typeof contractSchema>;
