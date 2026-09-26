export function formatCurrency(value: number | string) {
  const numberValue = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

export function toMonthKey(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function safeNumber(value: string | number | null | undefined) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export function getDefaultMonthRange() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
