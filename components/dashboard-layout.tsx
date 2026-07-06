"use client";

import Image from "next/image";
import AppSidebar from "./shared/sidebar";
import { Header } from "./shared/header";
import { AdminPageHeaderProvider } from "@/components/admin/admin-page-header-provider";
import { useAuthChecker } from "@/hooks/useAuthChecker";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import MobileSidebar from "./shared/mobileSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuthChecker();

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="mb-6 flex h-8 items-end justify-center space-x-2">
          <span
            className="w-2 rounded-md bg-primary animate-bar-bounce [animation-delay:-0.2s]"
            style={{ height: "40%" }}
          />
          <span
            className="w-2 rounded-md bg-primary animate-bar-bounce [animation-delay:-0.1s]"
            style={{ height: "70%" }}
          />
          <span
            className="w-2 rounded-md bg-primary animate-bar-bounce"
            style={{ height: "100%" }}
          />
          <span
            className="w-2 rounded-md bg-primary animate-bar-bounce [animation-delay:-0.1s]"
            style={{ height: "70%" }}
          />
          <span
            className="w-2 rounded-md bg-primary animate-bar-bounce [animation-delay:-0.2s]"
            style={{ height: "40%" }}
          />
        </div>

        <Image
          src="/logo.svg"
          alt="Logo"
          width={120}
          height={120}
          className="object-contain"
        />

        <p className="mt-6 text-sm text-muted-foreground">
          Loading admin panel...
        </p>
      </div>
    );
  }

  return (
    <AdminPageHeaderProvider>
    <SidebarProvider>
      <div className="admin-shell flex h-screen w-full relative">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <MobileSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <SidebarInset className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
    </AdminPageHeaderProvider>
  );
}
