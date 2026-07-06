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

export function getPlanLabel(
  planId: string,
  plans: { id: string; category: string; durationLabel: string }[],
  storedLabel?: string
): string {
  if (storedLabel?.trim()) return storedLabel.trim();

  const plan =
    plans.find((p) => p.id === planId) ??
    plans.find((p) => p.category === planId);

  if (!plan) return planId ? "Unknown plan" : "—";

  const label = [plan.category, plan.durationLabel].filter(Boolean).join(" · ");
  return label || truncateId(planId, 20);
}

export function getUserLabel(
  userId: string,
  users: {
    id: string;
    name?: string;
    displayName?: string;
    email?: string;
    uid?: string;
  }[],
  storedLabel?: string
): string {
  if (storedLabel?.trim()) return storedLabel.trim();

  const user =
    users.find((u) => u.id === userId) ??
    users.find((u) => u.uid === userId);

  if (!user) return userId ? truncateId(userId, 12) : "—";

  return (
    user.name?.trim() ||
    user.displayName?.trim() ||
    user.email?.trim() ||
    truncateId(userId, 12)
  );
}
