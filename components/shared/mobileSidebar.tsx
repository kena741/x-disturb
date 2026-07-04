"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  MapPin,
  Clock,
  Users,
  FileText,
  Receipt,
  LogOut,
  Menu,
  X,
  Bell,
  KeyIcon,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarRoutes = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Silent Zones", icon: MapPin, path: "/dashboard/silent-zones" },
  {
    label: "Real Time Activity",
    icon: Clock,
    path: "/dashboard/real-time-activity",
  },
  {
    label: "Users Management",
    icon: Users,
    path: "/dashboard/users-management",
  },
  { label: "Transactions", icon: Receipt, path: "/dashboard/transactions" },
  { label: "Subscription Plans", icon: CreditCard, path: "/dashboard/subscription-plans" },
  { label: "Reports", icon: FileText, path: "/dashboard/reports" },
  { label: "Push Notification", icon: Bell, path: "/dashboard/push-notification" },
  { label: "Referals", icon: KeyIcon, path: "/dashboard/referral-management" },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    // TODO: Hook into auth logic
    console.log("Logging out...");
  };

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#E66641] text-white rounded-md md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-[#E66641] text-white transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
          <h1 className="text-lg font-bold">x-disturb</h1>
          <button onClick={() => setOpen(false)} className="text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav stays at top, grows naturally */}
        <nav className="flex flex-col px-4 py-4 gap-2">
          {sidebarRoutes.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-[#d84327] transition-all"
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer stays locked to bottom */}
        <div className="mt-auto px-4 py-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
