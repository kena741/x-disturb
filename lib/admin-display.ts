export function formatAdminDate(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAdminDateShort(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatAdminAmount(
  amount: number,
  currency = "ETB"
): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function truncateId(id: string, length = 8): string {
  if (id.length <= length) return id;
  return `${id.slice(0, length)}…`;
}

export function formatAdminCount(count: number): string {
  return count.toLocaleString();
}
