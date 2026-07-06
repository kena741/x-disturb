"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { auth, db } from "@/app/firebase/config";
import { useAuthChecker } from "@/hooks/useAuthChecker";
import { session } from "@/lib/sessionStorage";
import NotificationPanel from "../dashboard/notification/notification-panel";
import { useAdminContext } from "../context-provider";
import { AdminThemeToggle } from "../admin/admin-theme-toggle";
import { AdminRouteHeader } from "../admin/admin-route-header";

interface AdminProfile {
  firstName?: string;
  lastName?: string;
}

export const Header = () => {
  const [profileData, setProfileData] = useState<AdminProfile | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { triggerRefetch } = useAdminContext();
  const id = session?.getItem("userId") || "admin_id";
  const { user, loading } = useAuthChecker();

  useEffect(() => {
    if (loading) return;

    const fetchAdminProfile = async () => {
      if (!user) {
        setFetchLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "admin_profile", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data() as AdminProfile);
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAdminProfile();
  }, [id, triggerRefetch, user, loading]);

  const initials = profileData?.firstName?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-30 min-h-[var(--header-height)] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-[var(--header-height)] items-center justify-between gap-4 px-4 py-2 md:px-8">
        <AdminRouteHeader />
        <div className="flex shrink-0 items-center gap-3">
          <AdminThemeToggle />
          <NotificationPanel />

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {loading || fetchLoading ? (
              <>
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="hidden md:block space-y-1.5">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-foreground capitalize">
                    {profileData?.lastName?.[0]?.toUpperCase()}.{" "}
                    {profileData?.firstName}
                  </div>
                  <div className="text-xs text-muted-foreground">Administrator</div>
                </div>
              </>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
