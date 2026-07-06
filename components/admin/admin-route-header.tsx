"use client";

import { usePathname } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAdminPageHeaderActionsFromProvider } from "@/components/admin/admin-page-header-provider";
import {
  getAdminPageMeta,
  getDashboardPageDescription,
} from "@/lib/admin-page-meta";
import { isDashboardDemoEnabled } from "@/lib/dashboard-demo-data";

export function AdminRouteHeader() {
  const pathname = usePathname();
  const actions = useAdminPageHeaderActionsFromProvider();
  const meta = getAdminPageMeta(pathname);

  if (!meta) {
    return <div className="min-w-0 flex-1" />;
  }

  const description =
    pathname === "/dashboard"
      ? getDashboardPageDescription(isDashboardDemoEnabled())
      : meta.description;

  return (
    <AdminPageHeader
      variant="shell"
      title={meta.title}
      description={description}
      backHref={meta.backHref}
      breadcrumbs={meta.breadcrumbs}
      actions={actions}
    />
  );
}
