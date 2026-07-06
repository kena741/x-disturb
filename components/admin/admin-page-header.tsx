import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminBreadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: AdminBreadcrumb[];
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: "page" | "shell";
}

export function adminHeaderButtonClassName(className?: string) {
  return cn(
    "h-9 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    className
  );
}

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  actions,
  className,
  variant = "page",
}: AdminPageHeaderProps) {
  const isShell = variant === "shell";

  return (
    <div className={cn(isShell ? "min-w-0 flex-1" : "space-y-1", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className={cn(
            "flex items-center gap-1.5 text-muted-foreground",
            isShell ? "mb-0.5 text-xs" : "text-sm"
          )}
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div
        className={cn(
          isShell
            ? "flex items-center justify-between gap-3"
            : "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        )}
      >
        <div
          className={cn(
            "min-w-0",
            isShell ? "flex items-center gap-2" : "flex items-start gap-3"
          )}
        >
          {backHref && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("shrink-0 h-8 w-8", !isShell && "mt-0.5")}
              asChild
            >
              <Link href={backHref} aria-label="Go back">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <div className="min-w-0">
            <h1
              className={cn(
                "font-semibold tracking-tight text-foreground",
                isShell
                  ? "truncate text-base md:text-lg"
                  : "text-2xl"
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "text-muted-foreground",
                  isShell
                    ? "truncate text-xs md:text-sm"
                    : "mt-1 text-sm"
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
