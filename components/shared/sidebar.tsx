"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	useSidebar,
} from "../ui/sidebar";
import { cn } from "@/lib/utils";
import { auth } from "@/firebase/config";
import { session } from "@/lib/sessionStorage";
import { signOut } from "firebase/auth";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export default function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { state, toggleSidebar } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<Sidebar
			collapsible="icon"
			className="h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
		>
			<SidebarHeader className="mb-2 px-2 pt-4">
				<div
					className={cn(
						"flex gap-2",
						isCollapsed
							? "flex-col items-center"
							: "items-center justify-between",
					)}
				>
					{isCollapsed ? (
						<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
							<span className="text-sm font-bold text-primary">X</span>
						</div>
					) : (
						<div className="min-w-0 rounded-md border border-sidebar-border bg-background/70 p-2 backdrop-blur-sm">
							<Image
								src="/logo.svg"
								alt="x-disturb logo"
								width={120}
								height={40}
								className="h-8 w-32 object-contain"
							/>
						</div>
					)}

					<button
						onClick={toggleSidebar}
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-background/80 text-sidebar-foreground/70 shadow-sm transition-all hover:bg-primary/10 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						{isCollapsed ? (
							<ChevronRight size={14} />
						) : (
							<ChevronLeft size={14} />
						)}
					</button>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<AdminSidebarNav pathname={pathname} collapsed={isCollapsed} />
			</SidebarContent>

			<SidebarFooter className="mt-auto border-t border-sidebar-border p-2">
				<button
					onClick={() => {
						signOut(auth);
						session.clear();
						router.push("/auth/login");
					}}
					className={cn(
						"flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-primary/10 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						isCollapsed && "justify-center px-2",
					)}
				>
					<LogOut className="h-4 w-4 shrink-0" />
					{!isCollapsed && <span>Log out</span>}
				</button>
			</SidebarFooter>
		</Sidebar>
	);
}
