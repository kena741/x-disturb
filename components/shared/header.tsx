"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useRouter } from "next/navigation"; // add at the top
import { auth } from "@/app/firebase/config";
import { useAuthChecker } from "@/hooks/useAuthChecker";
import { session } from "@/lib/sessionStorage";
import { signOut } from "firebase/auth";
import { Skeleton } from "../ui/skeleton";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import NotificationPanel from "../dashboard/notification/notification-panel";
import { useAdminContext } from "../context-provider";
import Link from "next/link";

export const Header = () => {
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const router = useRouter();

  /* eslint-disable */
  const [profileData, setProfileData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { triggerRefetch } = useAdminContext();

  const handleLogout = () => {
    signOut(auth);
    session.clear();
  };

  const id = session?.getItem("userId") || "admin_id";

  const { user, loading } = useAuthChecker();
  const username = user?.email?.split("@")[0] ?? "";
  const capitalizedInitials = username
    ? username
        .split(".")
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("")
    : "U";

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    const fetchAdminProfile = async () => {
      if (!user) {
        console.log("No authenticated user, skipping admin profile fetch.");
        setFetchLoading(false);
        return;
      }
      
      try {
        const docRef = doc(db, "admin_profile", id);
        const docSnap = await getDoc(docRef); // Await the promise
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
          console.log("Fetched profile data:", docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAdminProfile();
  }, [id, triggerRefetch, user, loading]);

  console.log(profileData);

  return (
    <header className="border-b border-gray-200 flex justify-end">
      <div className="container px-4 py-4 flex justify-end items-center">
        <div className="flex items-center gap-4">
          <NotificationPanel />

          <Link href="/dashboard/profile" className="px-4">
            {loading || fetchLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-10  bg-[#E66641]/20 w-10 rounded-full" />
                <div className="hidden md:block space-y-2">
                  <Skeleton className="h-4 w-28 bg-[#E66641]/20 rounded-md" />
                  <Skeleton className="h-3 w-20 bg-[#E66641]/20 rounded-md" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-orange-500 text-white">
                    {profileData?.firstName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="font-medium capitalize">
                    {profileData?.lastName[0]?.toUpperCase()}.{" "}
                    {profileData?.firstName}
                  </div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
