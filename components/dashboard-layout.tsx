"use client";

import AppSidebar from "./shared/sidebar";
import { Header } from "./shared/header";
import { AdminPageHeaderProvider } from "@/components/admin/admin-page-header-provider";
import { AdminShellSkeleton } from "@/components/admin/admin-shell-skeleton";
import { useAuthChecker } from "@/hooks/useAuthChecker";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import MobileSidebar from "./shared/mobileSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuthChecker();

  return (
    <AdminPageHeaderProvider>
      <SidebarProvider>
        <div className="admin-shell relative flex h-screen w-full">
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          <MobileSidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header />
            <SidebarInset className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
              {loading ? <AdminShellSkeleton /> : children}
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </AdminPageHeaderProvider>
  );
}
