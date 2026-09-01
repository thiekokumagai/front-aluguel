import { z } from 'zod';

export const propertySchema = z.object({
  name: z.string().min(2, 'O nome do imóvel é obrigatório'),
  type: z.enum(['Casa', 'Apartamento', 'Sala comercial', 'Terreno', 'Outro']),
  street: z.string().min(2, 'O endereço é obrigatório'),
  number: z.string().min(1, 'O número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'O bairro é obrigatório'),
  city: z.string().min(2, 'A cidade é obrigatória'),
  state: z.string().min(2, 'O estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP é obrigatório'),
  defaultRentValue: z.number().min(1, 'Informe um valor de aluguel válido'),
  notes: z.string().optional(),
  status: z.enum(['RENTED', 'AVAILABLE', 'INACTIVE']),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
