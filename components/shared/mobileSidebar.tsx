"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/app/firebase/config";
import { session } from "@/lib/sessionStorage";
import { signOut } from "firebase/auth";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    signOut(auth);
    session.clear();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
          <Image
            src="/logo.svg"
            alt="x-disturb logo"
            width={100}
            height={32}
            className="h-8 w-28 object-contain"
          />
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <AdminSidebarNav
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </div>

        <div className="border-t border-sidebar-border px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-primary/10 hover:text-sidebar-foreground"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
