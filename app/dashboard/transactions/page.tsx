"use client";

import TransactionTable from "@/components/dashboard/RecentTransactionsTable";
import { AdminPageContent } from "@/components/admin/admin-layout";

const Page = () => {
  return (
    <AdminPageContent>
      <TransactionTable />
    </AdminPageContent>
  );
};

export default Page;
