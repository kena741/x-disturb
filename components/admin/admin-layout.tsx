import { cn } from "@/lib/utils";

interface AdminPageContentProps {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}

export function AdminPageContent({
  children,
  wide = false,
  className,
}: AdminPageContentProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6",
        wide ? "max-w-none" : "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
