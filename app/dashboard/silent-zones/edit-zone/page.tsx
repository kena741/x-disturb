"use client";
import UpdateSilentZone from "@/components/dashboard/silent-zones/edit-silent-zone";
import { AdminPageContent } from "@/components/admin/admin-layout";

const Page = () => {
  return (
    <AdminPageContent>
      <UpdateSilentZone />
    </AdminPageContent>
  );
};

export default Page;
