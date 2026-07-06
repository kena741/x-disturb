export type AdminStatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pending"
  | "neutral"
  | "brand";

export const adminStatusToneClasses: Record<AdminStatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  pending: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  neutral: "bg-muted text-muted-foreground border-border",
  brand: "bg-[#e66641]/10 text-[#e66641] border-[#e66641]/20",
};

const transactionStatusMap: Record<string, AdminStatusTone> = {
  success: "success",
  completed: "success",
  pending: "pending",
  failed: "danger",
  cancelled: "neutral",
  canceled: "neutral",
};

const userStatusMap: Record<string, AdminStatusTone> = {
  active: "success",
  inactive: "neutral",
  suspended: "danger",
  pending: "pending",
};

const zoneStatusMap: Record<string, AdminStatusTone> = {
  active: "success",
  inactive: "neutral",
  draft: "pending",
};

export function getTransactionStatusTone(status: string): AdminStatusTone {
  return transactionStatusMap[status.toLowerCase()] ?? "neutral";
}

export function getUserStatusTone(active: boolean): AdminStatusTone {
  return active ? "success" : "neutral";
}

export function getZoneStatusTone(status: string): AdminStatusTone {
  return zoneStatusMap[status.toLowerCase()] ?? "neutral";
}

const notificationStatusMap: Record<string, AdminStatusTone> = {
  sent: "success",
  scheduled: "pending",
  failed: "danger",
  draft: "neutral",
};

export function getNotificationStatusTone(status: string): AdminStatusTone {
  return notificationStatusMap[status.toLowerCase()] ?? "neutral";
}

export function getStatusToneClasses(tone: AdminStatusTone): string {
  return adminStatusToneClasses[tone];
}
