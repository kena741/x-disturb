"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Calendar,
  Tag,
  Loader2,
  X,
  Check,
  AlertTriangle,
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

// ─── helpers ────────────────────────────────────────────────────────────────
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

// ─── Plan Card ───────────────────────────────────────────────────────────────
const PlanCard = ({
  plan,
  onEdit,
  onDelete,
  onToggle,
}: {
  plan: SubscriptionPlan;
  onEdit: (p: SubscriptionPlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}) => (
  <div className="relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
    {/* Status badge */}
    <span
      className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        plan.isActive
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
          : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      {plan.isActive ? "Active" : "Inactive"}
    </span>

    {/* Header */}
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E66641]/10">
        <CreditCard className="h-5 w-5 text-[#E66641]" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{plan.category}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Sort #{plan.sortOrder}</p>
      </div>
    </div>

    {/* Price */}
    <div className="flex items-end gap-1">
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
      <span className="mb-1 text-sm font-medium text-gray-500">{plan.currency}</span>
    </div>

    {/* Details */}
    <div className="flex flex-col gap-1.5 text-sm text-gray-600 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[#E66641]" />
        <span>{plan.durationLabel}</span>
        <span className="text-gray-400">·</span>
        <span>{plan.durationMonths} month{plan.durationMonths !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-[#E66641]" />
        <span>{plan.currency}</span>
      </div>
    </div>

    {/* Actions */}
    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
      {/* Toggle active */}
      <button
        onClick={() => onToggle(plan.id, plan.isActive)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-[#E66641] dark:text-gray-400"
        title={plan.isActive ? "Deactivate" : "Activate"}
      >
        {plan.isActive ? (
          <ToggleRight className="h-5 w-5 text-green-500" />
        ) : (
          <ToggleLeft className="h-5 w-5" />
        )}
        {plan.isActive ? "Deactivate" : "Activate"}
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(plan)}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:border-[#E66641] hover:text-[#E66641] dark:border-gray-600 dark:text-gray-400"
          title="Edit plan"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:border-red-400 hover:text-red-500 dark:border-gray-600 dark:text-gray-400"
          title="Delete plan"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

// ─── Modal ───────────────────────────────────────────────────────────────────
const PlanModal = ({
  initial,
  onClose,
  onSave,
}: {
  initial: (SubscriptionPlan & { _isEdit?: boolean }) | null;
  onClose: () => void;
  onSave: (data: SubscriptionPlanInput, id?: string) => Promise<void>;
}) => {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
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
      console.error("Failed to save plan:", e);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Edit Subscription Plan" : "Add Subscription Plan"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {err && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {err}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#E66641] focus:ring-2 focus:ring-[#E66641]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min={0}
                step={0.01}
                required
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#E66641] focus:ring-2 focus:ring-[#E66641]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Currency */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#E66641] focus:ring-2 focus:ring-[#E66641]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Label */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Duration Label
              </label>
              <input
                type="text"
                name="durationLabel"
                value={form.durationLabel}
                onChange={handleChange}
                placeholder="e.g. 1 month"
                required
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#E66641] focus:ring-2 focus:ring-[#E66641]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Duration Months */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Duration (months)
              </label>
              <input
                type="number"
                name="durationMonths"
                value={form.durationMonths}
                onChange={handleChange}
                min={1}
                required
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#E66641] focus:ring-2 focus:ring-[#E66641]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Sort Order */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Sort Order
              </label>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                min={0}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#E66641] focus:ring-2 focus:ring-[#E66641]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 col-span-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 accent-[#E66641]"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                Active (visible to users)
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#E66641] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#d4502e] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isEdit ? "Save Changes" : "Add Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm ──────────────────────────────────────────────────────────
const DeleteConfirm = ({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Plan?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This action is permanent and cannot be undone.
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SubscriptionPlansPage() {
  const { plans, loading } = useSubscriptionPlans();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<(SubscriptionPlan & { _isEdit?: boolean }) | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  // Stats
  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.isActive).length;
  const categories = Array.from(new Set(plans.map((p) => p.category)));

  const filteredPlans =
    filterCategory === "All"
      ? plans
      : plans.filter((p) => p.category === filterCategory);

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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Subscription Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage pricing plans shown to users in the X-Disturb app.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 self-start rounded-xl bg-[#E66641] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#d4502e] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Plan
        </button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Plans", value: loading ? "…" : String(totalPlans) },
          { label: "Active Plans", value: loading ? "…" : String(activePlans) },
          { label: "Categories", value: loading ? "…" : String(categories.length) },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{m.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      {!loading && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filterCategory === cat
                  ? "bg-[#E66641] text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Plan grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#E66641]" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 py-20 dark:border-gray-700">
          <CreditCard className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No subscription plans yet.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-1 flex items-center gap-2 rounded-xl bg-[#E66641] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d4502e]"
          >
            <Plus className="h-4 w-4" />
            Add your first plan
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* Add / Edit Modal */}
      {showModal && (
        <PlanModal
          initial={editTarget}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <DeleteConfirm
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}
