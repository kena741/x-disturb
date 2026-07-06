"use client";
import CreateSilentZone from "@/components/dashboard/silent-zones/new-silent-zone";
import { AdminPageContent } from "@/components/admin/admin-layout";

const Page = () => {
  return (
    <AdminPageContent>
      <CreateSilentZone />
    </AdminPageContent>
  );
};

export default Page;
