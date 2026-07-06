import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  loading = false,
  className,
}: AdminStatCardProps) {
  return (
    <Card className={cn("border-border shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </div>
            {change && (
              <span
                className={cn(
                  "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  changeType === "positive" &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                  changeType === "negative" &&
                    "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                  changeType === "neutral" &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {change}
              </span>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
