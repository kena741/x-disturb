import Link from "next/link";
import SilentZones from "@/components/dashboard/silent-zones/silent-zones-table";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { AdminPageHeaderActions } from "@/components/admin/admin-page-header-provider";
import { adminHeaderButtonClassName } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const page = () => {
  return (
    <AdminPageContent>
      <AdminPageHeaderActions>
        <Button
          asChild
          className={cn(
            adminHeaderButtonClassName(),
            "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Link href="/dashboard/silent-zones/new-zone">
            <Plus className="h-4 w-4" />
            Add New Zone
          </Link>
        </Button>
      </AdminPageHeaderActions>

      <SilentZones />
    </AdminPageContent>
  );
};

export default page;
