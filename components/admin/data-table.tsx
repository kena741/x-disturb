import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminTableShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTableShell({ children, className }: AdminTableShellProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AdminDataTableEmptyProps {
  message?: string;
  colSpan?: number;
}

export function AdminDataTableEmpty({
  message = "No results found",
  colSpan = 1,
}: AdminDataTableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-12 text-center text-sm text-muted-foreground"
      >
        {message}
      </td>
    </tr>
  );
}

interface AdminLoadingRowProps {
  columns: number;
  rows?: number;
}

export function AdminLoadingRow({ columns, rows = 5 }: AdminLoadingRowProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={`loading-row-${rowIdx}`}>
          {Array.from({ length: columns }).map((__, colIdx) => (
            <td key={colIdx} className="px-4 py-4">
              <Skeleton className="h-4 w-full rounded-md" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  className,
}: AdminPaginationProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        onClick={onPrev}
        disabled={currentPage === 1}
        size="icon"
        variant="outline"
        className="h-8 w-8"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={onNext}
        disabled={currentPage === totalPages}
        size="icon"
        variant="outline"
        className="h-8 w-8"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
