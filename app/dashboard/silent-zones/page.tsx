import Link from "next/link";
import SilentZones from "@/components/dashboard/silent-zones/silent-zones-table";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { AdminPageHeaderActions } from "@/components/admin/admin-page-header-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const page = () => {
  return (
    <AdminPageContent>
      <AdminPageHeaderActions>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-primary hover:bg-transparent hover:text-primary/80"
        >
          <Link href="/dashboard/silent-zones/new-zone" aria-label="Add new zone">
            <Plus className="h-5 w-5" />
          </Link>
        </Button>
      </AdminPageHeaderActions>

      <SilentZones />
    </AdminPageContent>
  );
};

export default page;
