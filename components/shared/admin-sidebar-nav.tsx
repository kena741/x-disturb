"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminNavGroups,
  isNavGroupActive,
  isNavItemActive,
} from "@/lib/admin-nav";

interface AdminSidebarNavProps {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

function getInitialOpenGroups(pathname: string): Record<string, boolean> {
  return Object.fromEntries(
    adminNavGroups.map((group) => [
      group.label,
      isNavGroupActive(pathname, group),
    ])
  );
}

export function AdminSidebarNav({
  pathname,
  collapsed = false,
  onNavigate,
}: AdminSidebarNavProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    getInitialOpenGroups(pathname)
  );

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      adminNavGroups.forEach((group) => {
        if (isNavGroupActive(pathname, group)) {
          next[group.label] = true;
        }
      });
      return next;
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const linkClassName = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive
        ? "bg-primary/15 text-primary"
        : "text-sidebar-foreground/70 hover:bg-primary/10 hover:text-sidebar-foreground",
      collapsed && "justify-center px-2"
    );

  if (collapsed) {
    return (
      <nav className="flex flex-col gap-1 px-2">
        {adminNavGroups.map((group, groupIndex) => (
          <div
            key={group.label}
            className={cn(
              "flex flex-col gap-0.5",
              groupIndex > 0 && "mt-2 border-t border-sidebar-border/70 pt-2"
            )}
          >
            {group.items.map((item) => {
              const isActive = isNavItemActive(pathname, item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onNavigate}
                  title={item.label}
                  className={linkClassName(isActive)}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-3 px-2">
      {adminNavGroups.map((group) => {
        const isOpen = openGroups[group.label] ?? true;
        const hasSingleItem = group.items.length === 1;

        return (
          <div key={group.label} className="space-y-0.5">
            {hasSingleItem ? (
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group.label}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-expanded={isOpen}
              >
                <span>{group.label}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    !isOpen && "-rotate-90"
                  )}
                />
              </button>
            )}

            {(hasSingleItem || isOpen) && (
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = isNavItemActive(pathname, item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onNavigate}
                      className={linkClassName(isActive)}
                    >
                      <item.icon size={18} className="shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
