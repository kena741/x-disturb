"use client";

import TransactionTable from "@/components/dashboard/RecentTransactionsTable";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { useTransaction } from "@/hooks/useTransaction";
import { formatAdminCount } from "@/lib/admin-display";

const Page = () => {
  const { transactions, loading } = useTransaction();

  const totalTransactions = transactions.length;
  const completedCount = transactions.filter((tx) =>
    ["completed", "success"].includes(tx.status.toLowerCase())
  ).length;
  const pendingCount = transactions.filter(
    (tx) => tx.status.toLowerCase() === "pending"
  ).length;
  const failedCount = transactions.filter(
    (tx) => tx.status.toLowerCase() === "failed"
  ).length;

  return (
    <AdminPageContent>
      <section className="space-y-4">
        <h2 className="admin-section-title">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            title="Total Transactions"
            value={loading ? "…" : formatAdminCount(totalTransactions)}
          />
          <AdminStatCard
            title="Completed"
            value={loading ? "…" : formatAdminCount(completedCount)}
          />
          <AdminStatCard
            title="Pending"
            value={loading ? "…" : formatAdminCount(pendingCount)}
          />
          <AdminStatCard
            title="Failed"
            value={loading ? "…" : formatAdminCount(failedCount)}
          />
        </div>
      </section>

      <TransactionTable />
    </AdminPageContent>
  );
};

export default Page;
