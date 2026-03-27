export function formatVND(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("de-DE"); // dot-separated thousands
  return amount < 0 ? `-${formatted}` : formatted;
}
