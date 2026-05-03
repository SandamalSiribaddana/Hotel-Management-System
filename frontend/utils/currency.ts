export function formatCurrency(amount: number | string): string {
  if (amount === undefined || amount === null) return "Rs. 0";
  const num = Number(amount);
  if (isNaN(num)) return "Rs. 0";
  return "Rs. " + num.toLocaleString('en-US');
}
