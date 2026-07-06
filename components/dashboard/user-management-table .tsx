"use client";

import Link from "next/link";
import { Trash2, Edit } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminTableShell,
  AdminDataTableEmpty,
  AdminLoadingRow,
} from "@/components/admin/data-table";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getUserStatusTone } from "@/lib/admin-status-badge";
import { formatAdminDate, formatAdminDateShort } from "@/lib/admin-display";
import { User } from "@/app/api/user-management-api";
import { Switch } from "@/components/ui/switch";

interface UserManagementTableProps {
  users: User[];
  handleToggle: (id: string, status: boolean) => void;
  handleDelete: (id: string) => void;
  isLoading: boolean;
}

const UserManagementTable = ({
  users,
  handleToggle,
  handleDelete,
  isLoading,
}: UserManagementTableProps) => {
  return (
    <AdminTableShell>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Role</TableHead>
              <TableHead className="text-muted-foreground">Referral Code</TableHead>
              <TableHead className="text-muted-foreground">Registered On</TableHead>
              <TableHead className="text-muted-foreground">Last Login</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <AdminLoadingRow columns={8} />
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell className="text-sm font-medium">
                    {user.name || user.displayName || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {user.role || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">{user.referralCode || "N/A"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt
                      ? formatAdminDateShort(user.createdAt.toDate())
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLogin
                      ? formatAdminDate(user.lastLogin.toDate())
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`users-management/${user.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="top">Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggle(user.id, user.isActive)}
                        aria-label={`Toggle status for ${user.name}`}
                      />
                      <AdminStatusBadge
                        label={user.isActive ? "Active" : "Inactive"}
                        tone={getUserStatusTone(user.isActive)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <AdminDataTableEmpty colSpan={8} message="No users found" />
            )}
          </TableBody>
        </Table>
      </div>
    </AdminTableShell>
  );
};

export default UserManagementTable;
