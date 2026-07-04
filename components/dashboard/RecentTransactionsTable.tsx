import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useTransaction } from "@/hooks/useTransaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";

type StatusType = "success" | "completed" | "pending" | "failed";

const statusBadgeStyle: Record<StatusType, string> = {
  success: "bg-green-100 text-green-600",
  completed: "bg-green-100 text-green-600",
  pending: "bg-orange-100 text-orange-500",
  failed: "bg-red-100 text-red-500",
};

const STATUS_OPTIONS = ["All", "success", "pending", "failed"] as const;
type FilterStatus = (typeof STATUS_OPTIONS)[number];

const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransactionTable() {
  const { transactions, loading } = useTransaction();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered =
    statusFilter === "All"
      ? transactions
      : transactions.filter(
          (tx) => tx.status.toLowerCase() === statusFilter.toLowerCase()
        );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleFilterChange = (status: FilterStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const skeletonRows = Array.from({ length: 5 }).map((_, idx) => (
    <TableRow key={`skeleton-${idx}`}>
      {Array.from({ length: 6 }).map((__, col) => (
        <TableCell key={col} className="px-6 py-4">
          <Skeleton className="h-4 w-full rounded-md" />
        </TableCell>
      ))}
    </TableRow>
  ));

  const handleExport = () => {
    const exportData = filtered.map((tx) => ({
      Date: formatDate(tx.created_at),
      "User ID": tx.user_id,
      "Plan ID": tx.plan_id,
      Amount: `${tx.amount} ${tx.currency}`,
      "TX Ref": tx.tx_ref,
      Status: tx.status,
      "Updated At": formatDate(tx.updated_at),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileBlob, "transactions.xlsx");
  };

  return (
    <div className="space-y-4">
      {/* Header row with title and filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-bold">Transactions</h2>

        {/* Status filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map((status) => {
            const isActive = statusFilter === status;
            const colorMap: Record<FilterStatus, string> = {
              All: "bg-gray-100 text-gray-700 hover:bg-gray-200",
              success: "bg-green-100 text-green-700 hover:bg-green-200",
              pending: "bg-orange-100 text-orange-600 hover:bg-orange-200",
              failed: "bg-red-100 text-red-600 hover:bg-red-200",
            };
            const activeColorMap: Record<FilterStatus, string> = {
              All: "bg-gray-700 text-white",
              success: "bg-green-600 text-white",
              pending: "bg-orange-500 text-white",
              failed: "bg-red-500 text-white",
            };
            return (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  isActive ? activeColorMap[status] : colorMap[status]
                }`}
              >
                {status}
                {status !== "All" && !loading && (
                  <span className="ml-1 opacity-70">
                    (
                    {
                      transactions.filter(
                        (tx) => tx.status.toLowerCase() === status.toLowerCase()
                      ).length
                    }
                    )
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground px-4">Date</TableHead>
              <TableHead className="text-muted-foreground">User ID</TableHead>
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">TX Ref</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              skeletonRows
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No transactions found
                  {statusFilter !== "All" && ` with status "${statusFilter}"`}.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="px-4 text-sm">
                    {formatDate(tx.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">
                    {tx.user_id}
                  </TableCell>
                  <TableCell className="text-sm">{tx.plan_id}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {tx.amount.toLocaleString()} {tx.currency}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono truncate max-w-[180px]">
                    {tx.tx_ref}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        statusBadgeStyle[tx.status.toLowerCase() as StatusType] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: export + pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Button
          onClick={handleExport}
          variant="outline"
          className="bg-muted text-red-500 hover:text-red-600"
        >
          Export Report
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrev}
            disabled={currentPage === 1}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            size="icon"
            variant="ghost"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
