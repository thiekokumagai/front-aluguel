export interface CalculatedChargeDetails {
  originalValue: number;
  daysOverdue: number;
  finePercent: number;
  fineValue: number;
  interestPercentMonth: number;
  interestValue: number;
  updatedValue: number;
}

export function calculateUpdatedCharge(
  originalValue: number,
  dueDateStr: string,
  finePercent: number = 2,
  interestPercentMonth: number = 1
): CalculatedChargeDetails {
  if (!dueDateStr) {
    return {
      originalValue,
      daysOverdue: 0,
      finePercent,
      fineValue: 0,
      interestPercentMonth,
      interestValue: 0,
      updatedValue: originalValue,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  if (daysOverdue <= 0) {
    return {
      originalValue,
      daysOverdue: 0,
      finePercent,
      fineValue: 0,
      interestPercentMonth,
      interestValue: 0,
      updatedValue: originalValue,
    };
  }

  // Fine calculation (fixed % of original)
  const fineValue = (originalValue * finePercent) / 100;

  // Interest calculation (daily pro-rata from monthly %)
  const dailyInterestRate = interestPercentMonth / 30 / 100;
  const interestValue = originalValue * dailyInterestRate * daysOverdue;

  const updatedValue = Math.round((originalValue + fineValue + interestValue) * 100) / 100;

  return {
    originalValue,
    daysOverdue,
    finePercent,
    fineValue: Math.round(fineValue * 100) / 100,
    interestPercentMonth,
    interestValue: Math.round(interestValue * 100) / 100,
    updatedValue,
  };
}
