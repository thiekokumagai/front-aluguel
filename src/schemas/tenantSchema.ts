import { z } from 'zod';

export const tenantSchema = z.object({
  name: z.string().min(2, 'O nome completo é obrigatório'),
  document: z.string().min(11, 'CPF ou CNPJ inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  email: z.string().email('E-mail inválido'),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
