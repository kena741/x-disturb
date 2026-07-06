"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Calendar,
  Tag,
  Loader2,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import {
  addSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  togglePlanActive,
  SubscriptionPlan,
  SubscriptionPlanInput,
} from "@/app/api/subscription-plans-api";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { AdminPageHeaderActions } from "@/components/admin/admin-page-header-provider";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminFilterPills } from "@/components/admin/admin-filter-panel";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminErrorAlert } from "@/components/admin/admin-error-alert";
import { getUserStatusTone } from "@/lib/admin-status-badge";
import { formatAdminCount } from "@/lib/admin-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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

const CATEGORIES = ["Christian", "Orthodox", "Protestant", "Mosque", "Library", "General"];
const CURRENCIES = ["ETB", "USD"];

const emptyForm = (): SubscriptionPlanInput => ({
  category: "General",
  currency: "ETB",
  durationLabel: "",
  durationMonths: 1,
  isActive: true,
  price: 0,
  sortOrder: 0,
});

function PlanCard({
  plan,
  onEdit,
  onDelete,
  onToggle,
}: {
  plan: SubscriptionPlan;
  onEdit: (p: SubscriptionPlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}) {
  return (
    <Card className="flex flex-col border-border shadow-sm">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base font-semibold">
                {plan.category}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Sort order {plan.sortOrder}
              </p>
            </div>
          </div>
          <AdminStatusBadge
            label={plan.isActive ? "Active" : "Inactive"}
            tone={getUserStatusTone(plan.isActive)}
          />
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {plan.price.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {plan.currency}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pb-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <span>
              {plan.durationLabel} · {plan.durationMonths} month
              {plan.durationMonths !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 shrink-0 text-primary" />
            <span>Billed in {plan.currency}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={plan.isActive}
            onCheckedChange={() => onToggle(plan.id, plan.isActive)}
            aria-label={plan.isActive ? "Deactivate plan" : "Activate plan"}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {plan.isActive ? "Visible" : "Hidden"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(plan)}
            aria-label="Edit plan"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(plan.id)}
            aria-label="Delete plan"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function PlanFormDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: (SubscriptionPlan & { _isEdit?: boolean }) | null;
  onClose: () => void;
  onSave: (data: SubscriptionPlanInput, id?: string) => Promise<void>;
}) {
  const isEdit = Boolean(initial?._isEdit);
  const [form, setForm] = useState<SubscriptionPlanInput>(
    initial
      ? {
          category: initial.category,
          currency: initial.currency,
          durationLabel: initial.durationLabel,
          durationMonths: initial.durationMonths,
          isActive: initial.isActive,
          price: initial.price,
          sortOrder: initial.sortOrder,
        }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            category: initial.category,
            currency: initial.currency,
            durationLabel: initial.durationLabel,
            durationMonths: initial.durationMonths,
            isActive: initial.isActive,
            price: initial.price,
            sortOrder: initial.sortOrder,
          }
        : emptyForm()
    );
    setErr(null);
  }, [open, initial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.durationLabel.trim()) {
      setErr("Duration label is required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onSave(form, initial?.id);
      onClose();
    } catch (e: unknown) {
      const msg =
        e instanceof Error && e.message.includes("permission")
          ? "Permission denied — Firestore rules may need to be deployed."
          : "Failed to save plan. Please try again.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>
            {isEdit ? "Edit subscription plan" : "Add subscription plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {err && <AdminErrorAlert title="Could not save plan" message={err} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationLabel">Duration label</Label>
              <Input
                id="durationLabel"
                name="durationLabel"
                value={form.durationLabel}
                onChange={handleChange}
                placeholder="e.g. 1 month"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMonths">Duration (months)</Label>
              <Input
                id="durationMonths"
                type="number"
                name="durationMonths"
                value={form.durationMonths}
                onChange={handleChange}
                min={1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                min={0}
              />
            </div>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive" className="font-normal">
                Active (visible to users)
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeletePlanDialog({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle>Delete plan?</DialogTitle>
          <p className="text-sm text-muted-foreground">
            This action is permanent and cannot be undone.
          </p>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanCardSkeleton() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="border-t border-border pt-4">
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function SubscriptionPlansPage() {
  const { plans, loading } = useSubscriptionPlans();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<
    (SubscriptionPlan & { _isEdit?: boolean }) | null
  >(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  const activePlans = plans.filter((p) => p.isActive).length;
  const categories = Array.from(new Set(plans.map((p) => p.category)));

  const filteredPlans =
    filterCategory === "All"
      ? plans
      : plans.filter((p) => p.category === filterCategory);

  const filterOptions = ["All", ...categories].map((cat) => ({
    value: cat,
    label: cat,
    count:
      cat === "All"
        ? plans.length
        : plans.filter((p) => p.category === cat).length,
  }));

  const handleOpenAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditTarget({ ...plan, _isEdit: true });
    setShowModal(true);
  };

  const handleSave = async (data: SubscriptionPlanInput, id?: string) => {
    if (id) {
      await updateSubscriptionPlan(id, data);
    } else {
      await addSubscriptionPlan(data);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await deleteSubscriptionPlan(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  const handleToggle = async (id: string, current: boolean) => {
    await togglePlanActive(id, current);
  };

  return (
    <AdminPageContent>
      <AdminPageHeaderActions>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-primary hover:bg-transparent hover:text-primary/80"
          onClick={handleOpenAdd}
          aria-label="Add plan"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </AdminPageHeaderActions>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          title="Total plans"
          value={formatAdminCount(plans.length)}
          icon={Layers}
          loading={loading}
        />
        <AdminStatCard
          title="Active plans"
          value={formatAdminCount(activePlans)}
          icon={CheckCircle2}
          loading={loading}
        />
        <AdminStatCard
          title="Categories"
          value={formatAdminCount(categories.length)}
          icon={Tag}
          loading={loading}
        />
      </div>

      {!loading && categories.length > 0 && (
        <AdminFilterPills
          options={filterOptions}
          value={filterCategory}
          onChange={setFilterCategory}
        />
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              No subscription plans yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create a plan to show pricing in the X-Disturb app.
            </p>
          </div>
          <Button type="button" onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add your first plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <PlanFormDialog
        open={showModal}
        initial={editTarget}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />

      <DeletePlanDialog
        open={Boolean(deleteId)}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminPageContent>
  );
}
