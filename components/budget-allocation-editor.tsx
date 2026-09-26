"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";

type CategoryOption = {
  id: number;
  name: string;
};

type AllocationItem = {
  id: number;
  monthlyPlanId: number;
  categoryId: number | null;
  plannedAmount: string;
  name?: string;
};

export function BudgetAllocationEditor({
  planId,
  planSalary,
  categories,
  allocations,
}: {
  planId: number;
  planSalary: string | number;
  categories: CategoryOption[];
  allocations: AllocationItem[];
}) {
  const router = useRouter();
  const initialValues = useMemo(() => {
    return Object.fromEntries(
      categories.map((category) => {
        const existing = allocations.find((entry) => entry.categoryId === category.id);
        return [String(category.id), String(existing?.plannedAmount ?? "0")];
      }),
    );
  }, [allocations, categories]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const totalPlanned = categories.reduce((sum, category) => {
    return sum + Number(values[String(category.id)] ?? 0);
  }, 0);

  const unallocated = Number(planSalary || 0) - totalPlanned;

  const handleChange = (categoryId: number, value: string) => {
    setValues((current) => ({ ...current, [String(categoryId)]: value }));
  };

  const handleSave = async (categoryId: number) => {
    setError("");
    const amount = Number(values[String(categoryId)] ?? 0);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Budget amount must be a valid non-negative number.");
      return;
    }

    const existing = allocations.find((entry) => entry.categoryId === categoryId);
    setSavingId(categoryId);

    try {
      const response = existing
        ? await fetch(`/api/allocations/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plannedAmount: amount }),
          })
        : await fetch(`/api/plans/${planId}/allocations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryId, plannedAmount: amount }),
          });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to save budget allocation.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save budget allocation.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Salary</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(Number(planSalary || 0))}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Total planned</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalPlanned)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Unallocated</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(unallocated)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const categoryAllocation = allocations.find((entry) => entry.categoryId === category.id);
          const value = values[String(category.id)] ?? "0";

          return (
            <div key={category.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{category.name}</p>
                  <p className="text-xs text-slate-500">
                    {categoryAllocation ? "Existing budget" : "New category budget"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    <span className="sr-only">{category.name} planned amount</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={value}
                      onChange={(event) => handleChange(category.id, event.target.value)}
                      className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right outline-none focus:border-emerald-500"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleSave(category.id)}
                    disabled={savingId === category.id}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingId === category.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
