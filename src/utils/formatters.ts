import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(dateString?: string, formatStr: string = 'dd/MM/yyyy'): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, formatStr, { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function formatCPFCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}

export function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
}

export function formatZipCode(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length === 8) {
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return value;
}

export function getDaysOverdue(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseISO(dueDateStr);
  if (!isValid(due)) return 0;
  due.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
