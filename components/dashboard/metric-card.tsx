"use client";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const MetricCard = ({
  title,
  value,
  change,
  changeType,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs",
              changeType === "positive" && "text-emerald-600",
              changeType === "negative" && "text-red-600",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
