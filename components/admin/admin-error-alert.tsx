import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdminErrorAlertProps {
  title?: string;
  message: string;
  className?: string;
}

export function AdminErrorAlert({
  title = "Something went wrong",
  message,
  className,
}: AdminErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
