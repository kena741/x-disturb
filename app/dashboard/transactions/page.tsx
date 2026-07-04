"use client";
import MetricCard from "@/components/dashboard/metric-card";
import TransactionTable from "@/components/dashboard/RecentTransactionsTable";
import { useTransaction } from "@/hooks/useTransaction";
import React from "react";

const Page = () => {
  const { transactions, loading } = useTransaction();

  const totalTransactions = transactions.length;
  const activeSubscriptions = transactions.filter(
    (tx) => ["completed", "success"].includes(tx.status.toLowerCase())
  ).length;
  const pendingPayments = transactions.filter(
    (tx) => tx.status.toLowerCase() === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Telebirr Transactions
        </h1>
        <p className="text-muted-foreground">
          View and manage telebirr payment transactions, monitor subscriptions,
          and handle invoicing.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Transactions"
            value={loading ? "..." : totalTransactions.toLocaleString()}
          />
          <MetricCard
            title="Completed"
            value={loading ? "..." : activeSubscriptions.toLocaleString()}
          />
          <MetricCard
            title="Pending Payments"
            value={loading ? "..." : pendingPayments.toLocaleString()}
          />
        </div>
      </div>
      <TransactionTable />
    </div>
  );
};

export default Page;
