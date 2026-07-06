import { cn } from "@/lib/utils";
import {
  AdminStatusTone,
  getStatusToneClasses,
} from "@/lib/admin-status-badge";

interface AdminStatusBadgeProps {
  label: string;
  tone?: AdminStatusTone;
  className?: string;
}

export function AdminStatusBadge({
  label,
  tone = "neutral",
  className,
}: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        getStatusToneClasses(tone),
        className
      )}
    >
      {label}
    </span>
  );
}
