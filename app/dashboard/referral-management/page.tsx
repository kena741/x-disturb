"use client";

import React, { useEffect, useState } from "react";
import {
  fetchReferralCodes,
  addReferralCode,
  updateReferralCode,
  deleteReferralCode,
  getUsersByReferralCode,
  sendPushToGroup,
  exportUsersByGroup,
  fetchReferralCodeById,
} from "@/app/api/referral-management-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { AdminPageHeaderActions } from "@/components/admin/admin-page-header-provider";
import {
  AdminTableShell,
  AdminDataTableEmpty,
} from "@/components/admin/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2, Send, Download, Eye, Loader, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User } from "@/app/api/user-management-api";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";

type ReferralCategory = "Orthodox" | "Protestant" | "Mosque" | "Library";

interface ReferralCode {
  id: string;
  name: string;
  description: string;
  category: ReferralCategory;
}

const CATEGORY_OPTIONS: ReferralCategory[] = [
  "Orthodox",
  "Protestant",
  "Mosque",
  "Library",
];

const ReferralManagementPage = () => {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [open, setOpen] = useState(false);
  const [editCode, setEditCode] = useState<ReferralCode | null>(null);
  const [formData, setFormData] = useState<
    Omit<ReferralCode, "id" | "createdAt">
  >({
    name: "",
    description: "",
    category: "Orthodox",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [viewingUsers, setViewingUsers] = useState<User[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const getCodes = async () => {
    const data = await fetchReferralCodes();
    setCodes(data);
  };

  useEffect(() => {
    getCodes();
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setIsSaving(true);
    try {
      if (editCode) {
        await updateReferralCode(editCode.id, formData);
        toast.success(`Updated ${formData.name}`);
      } else {
        await addReferralCode(formData);
        toast.success(`Added ${formData.name}`);
      }
      setOpen(false);
      setFormData({ name: "", description: "", category: "Orthodox" });
      setEditCode(null);
      getCodes();
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReferralCode(id);
      toast.success("Referral code deleted");
      getCodes();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleViewUsers = async (code: ReferralCode) => {
    try {
      const users = await getUsersByReferralCode(code.id);
      setViewingUsers(users);
      setSelectedGroupName(code.name);
      setIsViewModalOpen(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch users");
    }
  };

  const handleSendPush = async (code: ReferralCode) => {
    await sendPushToGroup(code.id);
    toast.success(`Push sent to ${code.name} group`);
  };

  const handleExport = async (code: ReferralCode) => {
    await exportUsersByGroup(code.id);
    toast.success(`Exported users for ${code.name}`);
  };

  const handleEdit = async (id: string) => {
    try {
      const code = await fetchReferralCodeById(id);
      if (code) {
        setEditCode(code);
        setFormData({
          name: code.name,
          description: code.description,
          category: code.category,
        });
        setOpen(true);
      } else {
        toast.error("Referral code not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch referral code");
    }
  };

  return (
    <AdminPageContent>
      <ToastContainer />
      <AdminPageHeaderActions>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-primary hover:bg-transparent hover:text-primary/80"
          onClick={() => {
            setEditCode(null);
            setFormData({ name: "", description: "", category: "Orthodox" });
            setOpen(true);
          }}
          aria-label="Add referral code"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </AdminPageHeaderActions>

      <AdminTableShell>
        <TooltipProvider delayDuration={200}>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="w-[1%] text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.length === 0 ? (
                <AdminDataTableEmpty colSpan={4} message="No referral codes yet" />
              ) : (
                codes.map((code) => (
                  <TableRow key={code.id} className="group">
                    <TableCell className="font-medium">{code.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {code.description || "—"}
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge label={code.category} tone="info" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleViewUsers(code)}
                              aria-label={`View users for ${code.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">View users</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleEdit(code.id)}
                              aria-label={`Edit ${code.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Edit</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleSendPush(code)}
                              aria-label={`Send push to ${code.name}`}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Send push</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleExport(code)}
                              aria-label={`Export users for ${code.name}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Export users</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(code.id)}
                              aria-label={`Delete ${code.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </AdminTableShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCode ? "Edit" : "Add"} Referral Code</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="referral-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="referral-name"
                placeholder="e.g. Orthodox Special"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="referral-description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="referral-description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="referral-category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as ReferralCategory,
                  })
                }
              >
                <SelectTrigger id="referral-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader size={16} className="animate-spin" />
              ) : editCode ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Users in <span className="text-primary">{selectedGroupName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto mt-4 space-y-3">
            {viewingUsers.length > 0 ? (
              viewingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-md border border-border bg-muted/40 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  {user.role && (
                    <AdminStatusBadge label={user.role} tone="neutral" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No users found.</p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageContent>
  );
};

export default ReferralManagementPage;
